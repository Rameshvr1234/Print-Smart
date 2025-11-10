import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Item } from '../types';
import * as db from '../services/database';
import Modal from '../components/Modal';

// --- Forms as separate components defined outside the main component ---

interface ItemFormProps {
  item: Item | null;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: item?.sku || '',
    name: item?.name || '',
    uom: item?.uom || '',
    reorder_level: item?.reorder_level || 0,
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'reorder_level' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku.trim() || !formData.name.trim() || !formData.uom.trim()) {
      setError('SKU, Item Name, and UOM are required.');
      return;
    }
    
    try {
      if (item) {
        const updatedItem = { ...item, ...formData };
        db.updateItem(updatedItem);
        onSave(updatedItem);
      } else {
        const newItem = db.addItem(formData);
        onSave(newItem);
      }
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
      <div>
        <label htmlFor="sku" className="block text-lg font-medium text-gray-700">SKU Code</label>
        <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required disabled={!!item} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 text-lg" />
      </div>
      <div>
        <label htmlFor="name" className="block text-lg font-medium text-gray-700">Item Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg" />
      </div>
      <div>
        <label htmlFor="uom" className="block text-lg font-medium text-gray-700">UOM (Unit of Measure)</label>
        <input type="text" name="uom" id="uom" value={formData.uom} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg" />
      </div>
       <div>
        <label htmlFor="reorder_level" className="block text-lg font-medium text-gray-700">Reorder Level</label>
        <input type="number" name="reorder_level" id="reorder_level" value={formData.reorder_level} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg" />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90">Save Item</button>
      </div>
    </form>
  );
};

interface StockUpdateFormProps {
  item: Item;
  onUpdate: () => void;
  onCancel: () => void;
}

const StockUpdateForm: React.FC<StockUpdateFormProps> = ({ item, onUpdate, onCancel }) => {
    const [quantity, setQuantity] = useState(0);
    const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');

    const handleUpdateStock = () => {
        let newStockQty = item.stock_qty;
        if (adjustmentType === 'in') {
            newStockQty += quantity;
        } else {
            newStockQty -= quantity;
        }
        
        if (newStockQty < 0) {
            alert('Stock quantity cannot be negative.');
            return;
        }

        db.updateItem({ ...item, stock_qty: newStockQty });
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800">{item.name}</h3>
            <p className="text-lg text-gray-600">Current Stock: {item.stock_qty} {item.uom}</p>
            <div className="flex items-center gap-4">
                <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value as 'in' | 'out')} className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg">
                    <option value="in">Stock In (+)</option>
                    <option value="out">Stock Out (-)</option>
                </select>
                <input 
                    type="number" 
                    value={quantity}
                    onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg"
                    placeholder="Quantity"
                />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button onClick={handleUpdateStock} className="px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90">Update Stock</button>
            </div>
        </div>
    );
};


const ItemsStockScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchItems = useCallback(() => {
    setItems(db.getItems());
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleOpenItemModal = (item: Item | null = null) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };
  
  const handleOpenStockModal = (item: Item) => {
    setSelectedItem(item);
    setIsStockModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsItemModalOpen(false);
    setIsStockModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = () => {
    fetchItems();
    handleCloseModals();
  };
  
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold text-brand-blue">Items / Stock</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search SKU or name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg"
          />
          <button
            onClick={() => handleOpenItemModal()}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New SKU
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">SKU</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Item Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Current Stock</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Reorder Level</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => {
                const isLowStock = item.stock_qty <= item.reorder_level;
                return (
                  <tr key={item.sku} className={`align-middle ${isLowStock ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700">{item.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap font-bold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                      {item.stock_qty} {item.uom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.reorder_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenStockModal(item)} className="text-brand-orange hover:text-opacity-80 font-bold py-2 px-4 rounded">Update Stock</button>
                      <button onClick={() => handleOpenItemModal(item)} className="text-brand-orange hover:text-opacity-80 font-bold py-2 px-4 rounded">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isItemModalOpen} onClose={handleCloseModals} title={selectedItem ? 'Edit Item' : 'Add New Item'}>
        <ItemForm item={selectedItem} onSave={handleSave} onCancel={handleCloseModals} />
      </Modal>
       <Modal isOpen={isStockModalOpen} onClose={handleCloseModals} title="Update Stock Quantity">
        {selectedItem && <StockUpdateForm item={selectedItem} onUpdate={handleSave} onCancel={handleCloseModals} />}
      </Modal>
    </div>
  );
};

export default ItemsStockScreen;