// src/components/Teams/TeamDashboard.jsx
import { useState, useEffect } from 'react';
import { Plus, Users, Crown, Edit3 } from 'lucide-react';
import { fetchMyTeams, createTeam, fetchMembers, inviteMember, removeMember, updateMemberRole } from '../../api/teams.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Shared/LoadingSpinner.jsx';

const ROLE_COLORS = { admin: 'var(--priority-high)', editor: 'var(--accent)', viewer: 'var(--text-muted)' };

const TeamDashboard = () => {
  const [teams, setTeams]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteForm, setInviteForm]   = useState({ email: '', role: 'editor' });

  const loadTeams = async () => {
    setLoading(true);
    try {
      const { data } = await fetchMyTeams();
      setTeams(data.teams || []);
      if (!selected && data.teams?.length > 0) setSelected(data.teams[0].team);
    } catch { toast.error('Failed to load teams.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTeams(); }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMembers(selected.id).then(({ data }) => setMembers(data.members || []));
  }, [selected]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      await createTeam({ name: newTeamName.trim() });
      toast.success('Team created!');
      setNewTeamName(''); setShowCreate(false);
      loadTeams();
    } catch { toast.error('Failed to create team.'); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await inviteMember(selected.id, inviteForm);
      toast.success('Member invited!');
      setInviteForm({ email: '', role: 'editor' }); setShowInvite(false);
      const { data } = await fetchMembers(selected.id);
      setMembers(data.members || []);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to invite.'); }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await removeMember(selected.id, userId);
    setMembers((prev) => prev.filter(m => m.user.id !== userId));
    toast.success('Member removed.');
  };

  const handleRoleChange = async (userId, role) => {
    await updateMemberRole(selected.id, userId, { role });
    setMembers((prev) => prev.map(m => m.user.id === userId ? { ...m, role } : m));
    toast.success('Role updated.');
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Teams List */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="flex items-center justify-between mb-2" style={{ padding: '0 0.25rem' }}>
          <span className="font-semibold text-sm">Your Teams</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)} id="create-team-btn">
            <Plus size={14} />
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreateTeam} style={{ marginBottom: '0.75rem' }}>
            <input id="new-team-name" placeholder="Team name…" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} style={{ marginBottom: '0.5rem' }} />
            <button type="submit" className="btn btn-primary btn-sm w-full">Create</button>
          </form>
        )}

        {teams.length === 0 ? (
          <div className="text-muted text-sm" style={{ padding: '0.5rem 0.25rem' }}>No teams yet.</div>
        ) : (
          teams.map(({ team, role }) => (
            <button
              key={team.id}
              className={`sidebar-link ${selected?.id === team.id ? 'active' : ''}`}
              onClick={() => setSelected(team)}
              style={{ borderRadius: 'var(--radius-sm)', marginBottom: '0.1rem', width: '100%', textAlign: 'left' }}
              id={`team-btn-${team.id}`}
            >
              <Users size={16} />
              <span className="truncate">{team.name}</span>
              {role === 'admin' && <Crown size={12} style={{ marginLeft: 'auto', color: 'var(--warning)' }} />}
            </button>
          ))
        )}
      </div>

      {/* Members Panel */}
      {selected ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold" style={{ fontSize: '1.05rem' }}>{selected.name}</h2>
              <p className="text-secondary text-sm">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(v => !v)} id="invite-member-btn">
              <Plus size={14} /> Invite
            </button>
          </div>

          {showInvite && (
            <form onSubmit={handleInvite} className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="invite-email">Email</label>
                  <input id="invite-email" type="email" placeholder="teammate@example.com" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="invite-role">Role</label>
                  <select id="invite-role" value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">Send Invite</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInvite(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {members.map((m) => (
              <div key={m.user.id} className="flex items-center gap-3" style={{ padding: '0.65rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div className="avatar avatar-sm">
                  {m.user.avatar_url ? <img src={m.user.avatar_url} alt="" /> : m.user.full_name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-sm font-semibold">{m.user.full_name || m.user.email}</div>
                  <div className="text-xs text-muted">{m.user.email}</div>
                </div>
                <select
                  value={m.role}
                  onChange={e => handleRoleChange(m.user.id, e.target.value)}
                  style={{ width: 'auto', fontSize: '0.78rem', padding: '0.2rem 0.4rem', color: ROLE_COLORS[m.role] }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '0.2rem 0.4rem' }} onClick={() => handleRemove(m.user.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">Select a team to view members</div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
