// src/pages/TeamPage.jsx
import Navbar from '../components/Shared/Navbar.jsx';
import Sidebar from '../components/Shared/Sidebar.jsx';
import TeamDashboard from '../components/Teams/TeamDashboard.jsx';

const TeamPage = () => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-content">
      <Navbar title="Teams" />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Teams</h1>
            <p className="page-subtitle">Manage your workspaces and collaborators</p>
          </div>
        </div>
        <TeamDashboard />
      </div>
    </div>
  </div>
);

export default TeamPage;
