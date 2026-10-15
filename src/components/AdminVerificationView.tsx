import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { CheckCircle2, XCircle, Shield, Award, Clock } from 'lucide-react';

interface AdminVerificationViewProps {
  logs: ActivityLog[];
  onApproveLog: (logId: string, bonusPts: number) => void;
  onRejectLog: (logId: string) => void;
}

export const AdminVerificationView: React.FC<AdminVerificationViewProps> = ({
  logs,
  onApproveLog,
  onRejectLog,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredLogs = logs.filter((log) => {
    return filterStatus === 'All' || log.status === filterStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Teacher & Admin Verification Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Proof Verification & Bonus Points Panel
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Review student activity proof photos, verify compliance, and grant bonus Verde Points to high-impact submissions.
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          {['All', 'Approved', 'Pending Verification'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Cards */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
            No submissions matching filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  {log.proofImageUrl && (
                    <img
                      src={log.proofImageUrl}
                      alt={log.challengeTitle}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">{log.studentName}</span>
                      <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        {log.grNo}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-800 mt-1">
                      {log.challengeTitle} ({log.quantity} {log.unitLabel})
                    </div>

                    <p className="text-xs text-slate-600 italic mt-1 font-mono">
                      "{log.proofNote}"
                    </p>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
                      <Clock className="w-3 h-3 inline" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">+{log.pointsEarned} Verde Points</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center">
                  {log.status === 'Approved' ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified ✓</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onApproveLog(log.id, 0)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 transition-all shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => onApproveLog(log.id, 50)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1 transition-all shadow-xs"
                        title="Approve with +50 Bonus Points for exceptional quality"
                      >
                        <Award className="w-4 h-4" />
                        <span>+50 Bonus</span>
                      </button>

                      <button
                        onClick={() => onRejectLog(log.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-all"
                        title="Reject / Request Revision"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
