import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-white/20 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern header */}
        <div className="flex justify-between items-center p-5 md:p-6 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-white/60 sticky top-0 backdrop-blur-md z-10">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-brand-orange-500 to-brand-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-brand-orange-500 p-2 rounded-xl hover:bg-white/50 transition-all duration-300 group"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area with scroll */}
        <div className="p-5 md:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;