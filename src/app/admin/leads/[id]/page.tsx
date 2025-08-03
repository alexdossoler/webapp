'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Lead {
  id: string;
  projectGoal: string;
  projectDescription?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  projectTimeline: string;
  estimatedBudget?: number;
  projectScope: string[];
  status: string;
  score: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  statusHistory: Array<{
    id: string;
    from: string;
    to: string;
    note?: string;
    createdAt: string;
    changedBy: {
      name: string;
      email: string;
    };
  }>;
}

export default function LeadDetails() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateForm, setUpdateForm] = useState({
    status: '',
    note: '',
    assignedToId: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch lead');
      }
      
      const data = await response.json();
      setLead(data.data);
      setUpdateForm(prev => ({
        ...prev,
        status: data.data.status,
        assignedToId: data.data.assignedTo?.id || ''
      }));
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm)
      });

      if (!response.ok) throw new Error('Failed to update lead');
      
      await fetchLead(); // Refresh data
      setUpdateForm(prev => ({ ...prev, note: '' })); // Clear note
    } catch (error) {
      console.error('Error updating lead:', error);
      setError('Failed to update lead');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-purple-100 text-purple-800',
      'proposal_sent': 'bg-indigo-100 text-indigo-800',
      'won': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 text-2xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Lead not found'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Lead Details</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
              {lead.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Project Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Project Goal</label>
                  <p className="mt-1 text-sm text-gray-900">{lead.projectGoal}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <p className="mt-1 text-sm text-gray-900">{lead.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Timeline</label>
                  <p className="mt-1 text-sm text-gray-900">{lead.projectTimeline}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Budget</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {lead.estimatedBudget ? `$${lead.estimatedBudget.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Project Scope</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {lead.projectScope.map((scope, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                {lead.projectDescription && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{lead.projectDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{lead.contactName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:text-indigo-800">
                      {lead.email}
                    </a>
                  </p>
                </div>
                {lead.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:text-indigo-800">
                        {lead.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {lead.notes}
                </div>
              </div>
            )}

            {/* Status History */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Status History</h2>
              <div className="space-y-4">
                {lead.statusHistory.map((history) => (
                  <div key={history.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.from)}`}>
                          {history.from.replace('_', ' ')}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.to)}`}>
                          {history.to.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(history.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Changed by {history.changedBy.name}
                    </p>
                    {history.note && (
                      <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                        {history.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Score */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score</h3>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  lead.score >= 80 ? 'text-green-600' :
                  lead.score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {lead.score}
                </div>
                <p className="text-sm text-gray-500 mt-1">out of 100</p>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Lead</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Add Note</label>
                  <textarea
                    value={updateForm.note}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, note: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Add a note about this update..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Lead'}
                </button>
              </form>
            </div>

            {/* Lead Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <p className="text-gray-900">{new Date(lead.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Last Updated:</span>
                  <p className="text-gray-900">{new Date(lead.updatedAt).toLocaleString()}</p>
                </div>
                {lead.assignedTo && (
                  <div>
                    <span className="font-medium text-gray-500">Assigned To:</span>
                    <p className="text-gray-900">{lead.assignedTo.name}</p>
                    <p className="text-gray-600">{lead.assignedTo.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
