import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { applicationOperations } from '../../../../../applications/applicationManager';
import Button from '../../../../../components/Button/Button';
import './EditApplicationPanel.css';

const EditApplicationPanel = ({ application, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: '',
    deadline: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (application) {
      console.log('Initial application:', application);
      console.log('Initial deadline:', application.deadline);
      
      // Convert UTC date to local date for the input
      let formattedDate = '';
      if (application.deadline) {
        const date = new Date(application.deadline);
        // Add timezone offset to get the correct local date
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        formattedDate = date.toISOString().split('T')[0];
      }
      
      console.log('Formatted date for form:', formattedDate);
      
      setFormData({
        name: application.name || '',
        category: application.category || '',
        description: application.description || '',
        status: application.status || '',
        deadline: formattedDate
      });
    }
  }, [application]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'deadline') {
      console.log('New deadline value:', value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert local date to UTC for storage
      let deadlineUTC = null;
      if (formData.deadline) {
        const date = new Date(formData.deadline);
        // Subtract timezone offset to get UTC
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        deadlineUTC = date.toISOString();
      }

      const updatedData = {
        ...formData,
        deadline: deadlineUTC
      };

      console.log('Data being sent to server:', updatedData);

      const updatedApplication = await applicationOperations.updateApplication(application.id, updatedData);
      console.log('Response from server:', updatedApplication);
      
      onUpdate(updatedApplication);
      onClose();
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!application) return null;

  return (
    <div className="slide-panel-overlay" onClick={onClose}>
      <div className="slide-panel-wrapper" onClick={e => e.stopPropagation()}>
        <button 
          className="slide-panel-close-btn"
          onClick={onClose}
          aria-label="Close panel"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        <div className="slide-panel-content">
          <form onSubmit={handleSubmit} className="edit-application-form">
            <div className="form-group">
              <label htmlFor="name">Application Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter application name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="follow-up">Follow-up</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={4}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                type="button"
                className="hover:text-inherit"
              >
                Cancel
              </Button>
              <Button
                variant="create"
                type="submit"
                isLoading={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditApplicationPanel; 