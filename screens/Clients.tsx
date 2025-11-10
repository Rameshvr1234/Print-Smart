import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Client } from '../types';
import * as db from '../services/database';
import Modal from '../components/Modal';

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    billing_name: client?.billing_name || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Client Name is required.');
      return;
    }
    const clientToSave: Client = {
      ...client,
      id: client?.id || 0,
      is_active: client?.is_active ?? true,
      ...formData,
    };
    
    if (client) {
      db.updateClient(clientToSave);
    } else {
      const newClient = db.addClient(formData);
      Object.assign(clientToSave, newClient);
    }
    onSave(clientToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      <div>
        <label htmlFor="name" className="block text-lg font-medium text-gray-700">Client Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-lg" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-lg font-medium text-gray-700">Contact Number (Optional)</label>
        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-lg" />
      </div>
      <div>
        <label htmlFor="billing_name" className="block text-lg font-medium text-gray-700">GST / Billing Name (Optional)</label>
        <input type="text" name="billing_name" id="billing_name" value={formData.billing_name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-lg" />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange">Cancel</button>
        <button type="submit" className="px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange">Save Client</button>
      </div>
    </form>
  );
};

const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(() => {
    setClients(db.getClients());
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => (a.is_active === b.is_active) ? a.name.localeCompare(b.name) : (a.is_active ? -1 : 1));
  }, [clients, searchTerm]);

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = () => {
    fetchClients();
    handleCloseModal();
  };
  
  const handleToggleActive = (client: Client) => {
    const updatedClient = { ...client, is_active: !client.is_active };
    db.updateClient(updatedClient);
    fetchClients();
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold text-brand-blue">Clients</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-lg"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange whitespace-nowrap"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Client
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Client Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map(client => (
                <tr key={client.id} className={`align-middle ${!client.is_active ? 'bg-gray-100 text-gray-600' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${client.is_active ? 'text-gray-900' : ''}`}>{client.name}</div>
                    <div className={`text-md ${client.is_active ? 'text-gray-500' : 'text-gray-600'}`}>{client.billing_name}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${client.is_active ? 'text-gray-700' : ''}`}>{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenModal(client)} className="text-brand-orange hover:text-opacity-80 font-bold py-2 px-4 rounded">Edit</button>
                    <button onClick={() => handleToggleActive(client)} className={`${client.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} font-bold py-2 px-4 rounded`}>
                      {client.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Edit Client' : 'Add New Client'}>
        <ClientForm client={editingClient} onSave={handleSaveClient} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ClientsScreen;