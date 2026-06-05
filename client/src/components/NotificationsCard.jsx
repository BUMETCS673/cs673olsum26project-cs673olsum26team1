import React from 'react';

const NotificationsCard = ({ notifications = [], onMarkAsRead }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong className="mb-0">Notifications</strong>
        {unreadCount > 0 && (
          <span className="badge bg-danger rounded-pill">{unreadCount} new</span>
        )}
      </div>
      <ul className="list-group list-group-flush">
        {notifications.length === 0 ? (
          <li className="list-group-item text-muted">No notifications yet.</li>
        ) : (
          notifications.map(n => (
            <li
              key={n.id}
              className={`list-group-item d-flex justify-content-between align-items-start ${
                !n.isRead ? 'list-group-item-warning' : ''
              }`}
            >
              <div>
                <p className="mb-1">{n.message}</p>
                <small className="text-muted">
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
              {!n.isRead && (
                <button
                  className="btn btn-sm btn-outline-secondary ms-3 flex-shrink-0"
                  onClick={() => onMarkAsRead(n.id)}
                >
                  Mark read
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationsCard;
