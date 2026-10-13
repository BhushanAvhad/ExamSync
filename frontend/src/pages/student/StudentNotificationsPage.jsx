import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FilterBar } from '../../components/admin/FilterBar';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/admin/Toast';
import {
  BellIcon,
  CheckCheckIcon,
  CalendarDaysIcon,
  DoorIcon,
  InfoIcon,
  ClockIcon,
} from '../../components/ui/Icons';
import { INITIAL_STUDENT_NOTIFICATIONS } from '../../data/studentDemoData';
import { useAuth } from '../../context/useAuth';
import { studentPortalService } from '../../services/studentPortalService';

export function StudentNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(INITIAL_STUDENT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterReadStatus, setFilterReadStatus] = useState('all'); // 'all' | 'unread' | 'read'
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await studentPortalService.getNotifications(user?.id);
        if (data && data.length > 0) setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'all' || n.category === selectedCategory;

      const matchesRead =
        filterReadStatus === 'all' ||
        (filterReadStatus === 'unread' && !n.read) ||
        (filterReadStatus === 'read' && n.read);

      return matchesSearch && matchesCategory && matchesRead;
    });
  }, [notifications, searchQuery, selectedCategory, filterReadStatus]);

  const handleMarkAsRead = async (id) => {
    try {
      await studentPortalService.markNotificationRead(id);
    } catch (e) {
      console.warn('markNotificationRead local fallback:', e);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setToastMessage('Notification marked as read');
  };

  const handleMarkAllAsRead = async () => {
    for (const n of notifications) {
      if (!n.read) {
        try {
          await studentPortalService.markNotificationRead(n.id);
        } catch (_) {}
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setToastMessage('All notifications marked as read');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Room Changed':
        return <DoorIcon size={16} />;
      case 'Upcoming Exam Reminder':
        return <ClockIcon size={16} />;
      case 'Timetable Published':
        return <CalendarDaysIcon size={16} />;
      default:
        return <InfoIcon size={16} />;
    }
  };

  return (
    <div className="admin-page-content student-notif-page">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Examination Alerts & Notifications"
        subtitle="Stay updated with schedule publications, venue relocations, and official invigilation notices."
        category="Alerts"
        badge={
          unreadCount > 0 ? (
            <span className="notif-count-pill">
              <span className="notif-dot" />
              {unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="publication-badge-pill published">
              All Alerts Read
            </span>
          )
        }
        actions={
          unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<CheckCheckIcon size={15} />}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )
        }
      />

      {/* Demo Notice */}
      <div className="admin-banner info-banner">
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Demonstration Notification Center</strong> — Alerts demonstrate institutional candidate communication channels. Read states are persisted in client session memory.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notifications by keyword or category..."
        totalResults={filteredNotifications.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setFilterReadStatus('all');
        }}
        filters={[
          {
            id: 'notif-read-filter',
            value: filterReadStatus,
            onChange: setFilterReadStatus,
            ariaLabel: 'Filter by Read Status',
            options: [
              { label: 'All Alerts', value: 'all' },
              { label: 'Unread Only', value: 'unread' },
              { label: 'Read Only', value: 'read' },
            ],
          },
          {
            id: 'notif-category-filter',
            value: selectedCategory,
            onChange: setSelectedCategory,
            ariaLabel: 'Filter by Category',
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Timetable Published', value: 'Timetable Published' },
              { label: 'Room Changed', value: 'Room Changed' },
              { label: 'Upcoming Exam Reminder', value: 'Upcoming Exam Reminder' },
              { label: 'General Exam Notice', value: 'General Exam Notice' },
            ],
          },
        ]}
      />

      {/* Notifications List */}
      <div className="student-notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="admin-card notif-empty-state">
            <div className="table-empty-icon">
              <BellIcon size={24} />
            </div>
            <h4>No notifications found</h4>
            <p>You are all caught up with your examination notices.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`student-notif-item-card ${notif.read ? 'is-read' : 'is-unread'} ${notif.urgent ? 'is-urgent' : ''}`}
            >
              <div className="notif-cat-icon-col">
                <div className={`notif-type-icon ${notif.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {getCategoryIcon(notif.category)}
                </div>
              </div>

              <div className="notif-main-col">
                <div className="notif-top-row">
                  <div className="notif-title-group">
                    <span className="notif-cat-tag">{notif.category}</span>
                    <h3 className="notif-item-heading">{notif.title}</h3>
                  </div>
                  <span className="notif-timestamp">{notif.timestamp}</span>
                </div>

                <p className="notif-body-text">{notif.message}</p>

                <div className="notif-bottom-row">
                  {!notif.read ? (
                    <button
                      type="button"
                      className="notif-action-btn"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      Mark as read
                    </button>
                  ) : (
                    <span className="notif-read-indicator">Read</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentNotificationsPage;
