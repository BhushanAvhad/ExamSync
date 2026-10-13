const { GeneticTimetableScheduler, validateSchedule } = require('../services/scheduler');
const { loadSchedulingContext } = require('../services/dataLoader');
const { supabase } = require('../config/supabase');

/**
 * Generate Examination Timetable using the Genetic Algorithm.
 * POST /api/timetable/generate
 */
async function generateTimetable(req, res) {
  try {
    const { sessionId, settings = {}, saveAsDraft = false, institutionalData = null } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error: sessionId is required.',
      });
    }

    // 1. Load institutional context from Supabase, created institutionalData, or verified VIT dataset
    let context;
    try {
      context = await loadSchedulingContext(sessionId, req.userClient, institutionalData);
    } catch (err) {
      return res.status(422).json({
        success: false,
        error: `Data loading failure: ${err.message}`,
      });
    }

    // 2. Configure Genetic Algorithm
    const ga = new GeneticTimetableScheduler({
      populationSize: Number(settings.populationSize) || 60,
      maxGenerations: Number(settings.maxGenerations) || 120,
      mutationRate: Number(settings.mutationRate) || 0.18,
      seed: settings.seed !== undefined ? Number(settings.seed) : Date.now(),
    });

    // 3. Execute GA optimization run
    const result = ga.run(context);

    if (!result.success) {
      // Record diagnostics in conflict_logs for institutional auditing
      const dbClient = req.userClient || supabase;
      if (dbClient && context.session.id) {
        try {
          await dbClient.from('conflict_logs').insert({
            exam_session_id: context.session.id,
            conflict_type: 'OPTIMIZATION_INFEASIBLE',
            severity: 'High',
            entity_reference: context.session.id,
            description: result.error || 'Failed to converge on a valid zero-clash timetable within generational limit.',
            suggested_resolution: 'Increase available exam room capacity, widen session date window, or split large cohorts.',
            status: 'Unresolved',
          });
        } catch (_) {}
      }

      return res.status(422).json({
        success: false,
        error: result.error || 'Optimization completed but failed hard constraint validation.',
        hardViolationsCount: result.hardViolationsCount,
        diagnostics: result.diagnostics,
        validationReport: result.validationReport,
      });
    }

    // 4. Optionally persist draft to database
    if (saveAsDraft) {
      const db = req.userClient || supabase;
      if (db) {
        try {
          await db
            .from('exam_timetables')
            .delete()
            .eq('exam_session_id', context.session.id)
            .eq('is_published', false);

          const dbRows = result.timetable.map((t) => ({
            exam_session_id: context.session.id,
            subject_id: t.subjectId,
            class_id: t.classId,
            room_id: t.roomId,
            exam_date: t.date,
            start_time: t.startTime,
            end_time: t.endTime,
            duration_minutes: t.durationMinutes,
            status: 'Optimized',
            is_published: false,
          }));

          const { error: insertErr } = await db
            .from('exam_timetables')
            .insert(dbRows);

          if (insertErr) {
            console.warn('[timetableController] Draft persistence notice:', insertErr.message);
          }
        } catch (dbErr) {
          console.warn('[timetableController] Draft persistence exception:', dbErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      sessionId: context.session.id,
      sessionName: context.session.name,
      generationCount: result.generationCount,
      elapsedMs: result.elapsedMs,
      bestFitness: result.bestFitness,
      hardViolationsCount: result.hardViolationsCount,
      timetable: result.timetable,
      validationReport: result.validationReport,
      diagnostics: result.diagnostics,
      savedAsDraft: Boolean(saveAsDraft),
    });
  } catch (err) {
    console.error('[timetableController] Unexpected generation error:', err);
    return res.status(500).json({
      success: false,
      error: `Internal scheduling error: ${err.message}`,
    });
  }
}

/**
 * Retrieve saved timetable drafts for an examination session.
 * GET /api/timetable/drafts
 */
async function getDrafts(req, res) {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId query parameter is required.' });
    }

    const { data, error } = await supabase
      .from('exam_timetables')
      .select(`
        id,
        exam_session_id,
        exam_date,
        start_time,
        end_time,
        duration_minutes,
        status,
        is_published,
        subjects ( id, code, name ),
        classes ( id, name, division ),
        exam_rooms ( id, room_number, capacity )
      `)
      .eq('exam_session_id', sessionId)
      .order('exam_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      drafts: data || [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Officially Publish an Approved Examination Timetable.
 * POST /api/timetable/publish
 */
async function publishTimetable(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    // Update status to published
    const { data, error } = await supabase
      .from('exam_timetables')
      .update({
        is_published: true,
        status: 'Scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('exam_session_id', sessionId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No timetable records found to publish for this examination session.',
      });
    }

    // Update session status to Scheduled
    await supabase
      .from('exam_sessions')
      .update({ status: 'Scheduled' })
      .eq('id', sessionId);

    // Create institutional notification notices for students
    try {
      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (students && students.length > 0) {
        const notices = students.slice(0, 100).map((s) => ({
          student_id: s.id,
          title: 'Official Examination Timetable Published',
          category: 'Timetable Published',
          message: 'The official examination timetable has been finalized and published. Please review your personalized schedule.',
          urgent: true,
          is_read: false,
        }));
        await supabase.from('student_notifications').insert(notices);
      }
    } catch (_) {}

    return res.status(200).json({
      success: true,
      publishedCount: data.length,
      message: `Successfully published ${data.length} examination timetable records.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Retrieve Conflict Logs for an Examination Session.
 * GET /api/timetable/conflicts/:sessionId
 */
async function getConflicts(req, res) {
  try {
    const { sessionId } = req.params;
    const { data, error } = await supabase
      .from('conflict_logs')
      .select('*')
      .eq('exam_session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      conflicts: data || [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  generateTimetable,
  getDrafts,
  publishTimetable,
  getConflicts,
};
