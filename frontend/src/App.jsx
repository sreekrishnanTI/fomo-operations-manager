import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [operations, setOperations] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadOperations();
  }, []);

  async function loadOperations() {
    try {
      setErrorMessage('');
      const response = await fetch(`${API_URL}/api/operations`);
      if (!response.ok) {
        throw new Error('Could not load operations.');
      }
      const data = await response.json();
      setOperations(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Please add a title before creating an operation.');
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage('');
      const response = await fetch(`${API_URL}/api/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not create operation.');
      }
      setOperations((currentOperations) => [data, ...currentOperations]);
      setFormData({ title: '', description: '' });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleStatus(operation) {
    const nextStatus = operation.status === 'completed' ? 'pending' : 'completed';
    try {
      setErrorMessage('');
      const response = await fetch(`${API_URL}/api/operations/${operation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: operation.title,
          description: operation.description,
          status: nextStatus
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not update operation.');
      }
      setOperations((currentOperations) =>
        currentOperations.map((currentOperation) =>
          currentOperation.id === data.id ? data : currentOperation
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDelete(id) {
    try {
      setErrorMessage('');
      const response = await fetch(`${API_URL}/api/operations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not delete operation.');
      }
      setOperations((currentOperations) =>
        currentOperations.filter((operation) => operation.id !== id)
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Operations desk</p>
          <h1>FOMO</h1>
          <p>Simple Operations Manager</p>
        </div>
        <span className="header-mark" aria-hidden="true">FM</span>
      </header>

      <main className="main-content">
        <section className="create-section" aria-labelledby="create-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Keep work moving</p>
              <h2 id="create-heading">Create an operation</h2>
            </div>
            <span className="section-number">01</span>
          </div>
          <form className="operation-form" onSubmit={handleCreate}>
            <label>
              Title
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Review weekly metrics"
                maxLength="255"
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add a little context for the team"
                rows="3"
              />
            </label>
            <button className="primary-button" type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Operation'}
            </button>
          </form>
        </section>

        <section className="operations-section" aria-labelledby="operations-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your current workload</p>
              <h2 id="operations-heading">Operations</h2>
            </div>
            <span className="operation-count">{operations.length}</span>
          </div>

          {errorMessage && <p className="message error-message" role="alert">{errorMessage}</p>}
          {isLoading && <p className="message">Loading operations...</p>}
          {!isLoading && operations.length === 0 && (
            <p className="message empty-message">No operations yet. Add your first one above.</p>
          )}
          <div className="operations-list">
            {operations.map((operation) => (
              <article className="operation-card" key={operation.id}>
                <div className="operation-card-content">
                  <div className="operation-title-row">
                    <h3>{operation.title}</h3>
                    <span className={`status status-${operation.status}`}>{operation.status}</span>
                  </div>
                  <p className="operation-description">{operation.description || 'No description provided.'}</p>
                  <time dateTime={operation.created_at}>
                    Created {new Date(operation.created_at).toLocaleDateString()}
                  </time>
                </div>
                <div className="operation-actions">
                  <button className="secondary-button" type="button" onClick={() => toggleStatus(operation)}>
                    {operation.status === 'completed' ? 'Mark Pending' : 'Complete'}
                  </button>
                  <button className="delete-button" type="button" onClick={() => handleDelete(operation.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
