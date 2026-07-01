import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/v1/student/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        
        if (json.status === 'success') {
          setData(json.data);
        } else {
          setError('Gagal mengambil data dashboard');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [token]);

  return (
    <div className="max-w-[1024px] mx-auto p-xl">
      <header className="flex items-center justify-between mb-2xl">
        <div>
          <h1 className="mb-xs">Selamat pagi, {user?.name}</h1>
          <p className="text-secondary text-body-sm font-mono">{user?.nim}</p>
        </div>
        <Button variant="secondary" onClick={logout}>Sign Out</Button>
      </header>

      {error && (
        <Badge variant="error" className="mb-lg">{error}</Badge>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Academic Card */}
        <Card>
          <h3 className="mb-md">Academic</h3>
          {loading ? (
            <div className="h-4 bg-border animate-pulse rounded w-2/3"></div>
          ) : (
            <div className="flex flex-col gap-xs">
              <span className="text-body-sm text-secondary">Status Service:</span>
              <span className="text-body-md font-medium text-primary">
                {data?.academic}
              </span>
            </div>
          )}
        </Card>

        {/* Finance Card */}
        <Card>
          <h3 className="mb-md">Finance</h3>
          {loading ? (
            <div className="h-4 bg-border animate-pulse rounded w-2/3"></div>
          ) : (
            <div className="flex flex-col gap-xs">
              <span className="text-body-sm text-secondary">Status Service:</span>
              <span className="text-body-md font-medium text-primary">
                {data?.finance}
              </span>
            </div>
          )}
        </Card>

        {/* Library Card */}
        <Card>
          <h3 className="mb-md">Library</h3>
          {loading ? (
            <div className="h-4 bg-border animate-pulse rounded w-2/3"></div>
          ) : (
            <div className="flex flex-col gap-xs">
              <span className="text-body-sm text-secondary">Status Service:</span>
              <span className="text-body-md font-medium text-primary">
                {data?.library}
              </span>
            </div>
          )}
        </Card>
      </div>
      
      {/* Example Table structure per DESIGN.md */}
      <div className="mt-2xl">
        <h2 className="mb-md">Recent Activity</h2>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral border-b border-border">
              <tr>
                <th className="p-md text-label text-secondary font-medium uppercase tracking-wider">Date</th>
                <th className="p-md text-label text-secondary font-medium uppercase tracking-wider">Activity</th>
                <th className="p-md text-label text-secondary font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="text-body-sm">
              <tr className="border-b border-border last:border-0 hover:bg-neutral/50 transition-colors">
                <td className="p-md text-secondary">Today</td>
                <td className="p-md text-primary font-medium">System login detected</td>
                <td className="p-md"><Badge variant="success">Success</Badge></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
