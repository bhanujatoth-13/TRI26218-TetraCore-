import React from 'react';
import { Layers, X, Sparkles, Check, ArrowRight, Gamepad2, Layout, Terminal } from 'lucide-react';
import { ProjectTemplate } from '../types/ide';
import { PROJECT_TEMPLATES } from '../constants/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
  activeTemplateId: string;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId
}) => {
  if (!isOpen) return null;

  const getTemplateIcon = (name: string) => {
    switch (name) {
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-emerald-400" />;
      default:
        return <Layout className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-[#18181b] border border-[#3f3f46] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Project Templates</h2>
              <p className="text-xs text-slate-400">Choose a starter stack to preview in this IDE</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#27272a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {PROJECT_TEMPLATES.map(tpl => {
            const isCurrent = tpl.id === activeTemplateId;
            return (
              <div
                key={tpl.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCurrent 
                    ? 'bg-indigo-950/30 border-indigo-500/70 ring-1 ring-indigo-500/30' 
                    : 'bg-[#1f1f23]/60 border-[#27272a] hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2.5 rounded-xl bg-[#141416] border border-[#27272a] shrink-0 mt-0.5">
                    {getTemplateIcon(tpl.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{tpl.name}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-indigo-500/20">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {tpl.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span>{tpl.files.length} files included</span>
                      <span>•</span>
                      <span>Ready to run</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-600/90 text-white cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Current
                    </>
                  ) : (
                    <>
                      Load Template <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#121214] border-t border-[#27272a] text-xs text-slate-400 flex items-center justify-between">
          <span>Synced with <b>poluanjali/IDE</b> repository preview</span>
          <button onClick={onClose} className="hover:text-white font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
