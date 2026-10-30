import React, { useState, useEffect } from 'react';
import { Home, List, PieChart, Plus, X, Wallet, TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState('reports');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [reportType, setReportType] = useState('expense'); 
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('dompetku_data');
    return saved ? JSON.parse(saved) : [];
  });

  const defaultForm = {
    type: 'expense',
    amount: '',
    category: 'Makanan',
    note: '',
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    localStorage.setItem('dompetku_data', JSON.stringify(transactions));
  }, [transactions]);

  const expenseCategories = [
    { id: 'Makanan', icon: '🍔', color: '#F59E0B' },
    { id: 'Transportasi', icon: '🚗', color: '#3B82F6' },
    { id: 'Tagihan', icon: '💡', color: '#8B5CF6' },
    { id: 'Belanja', icon: '🛍️', color: '#EC4899' },
    { id: 'Hiburan', icon: '🎬', color: '#14B8A6' },
    { id: 'Lainnya', icon: '💸', color: '#64748B' },
  ];

  const incomeCategories = [
    { id: 'Gaji', icon: '💼', color: '#10B981' },
    { id: 'Bonus', icon: '🎁', color: '#3B82F6' },
    { id: 'Investasi', icon: '📈', color: '#8B5CF6' },
    { id: 'Pemberian', icon: '🤝', color: '#F43F5E' },
    { id: 'Jualan', icon: '🏪', color: '#F59E0B' },
    { id: 'Lainnya', icon: '💰', color: '#64748B' },
  ];

  const getCategoryDetail = (type, catId) => {
    if (type === 'income') return incomeCategories.find(c => c.id === catId) || { id: catId || 'Pemasukan', icon: '💰', color: '#10B981' };
    return expenseCategories.find(c => c.id === catId) || { id: catId || 'Pengeluaran', icon: '💸', color: '#F43F5E' };
  };

  const openModal = () => {
    setEditId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData(defaultForm);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    let finalCategory = formData.category;
    if (formData.type === 'income' && !incomeCategories.find(c => c.id === finalCategory)) finalCategory = 'Gaji';
    if (formData.type === 'expense' && !expenseCategories.find(c => c.id === finalCategory)) finalCategory = 'Makanan';

    const dataToSave = {
      ...formData,
      category: finalCategory,
      amount: Number(formData.amount)
    };

    if (editId) {
      setTransactions(transactions.map(t => t.id === editId ? { ...t, ...dataToSave } : t));
    } else {
      setTransactions([{ id: Date.now(), ...dataToSave }, ...transactions]);
    }
    closeModal();
  };

  const handleEdit = (t) => {
    setFormData({ type: t.type, amount: t.amount, category: t.category, note: t.note || '', date: t.date });
    setEditId(t.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const cashFlowTotal = totalIncome + totalExpense;
  const incomePercentage = cashFlowTotal > 0 ? (totalIncome / cashFlowTotal) * 100 : 0;

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const currentCategories = reportType === 'income' ? incomeCategories : expenseCategories;
  const chartData = currentCategories.map(cat => ({
    name: cat.id,
    value: transactions.filter(t => t.type === reportType && t.category === cat.id).reduce((acc, curr) => acc + curr.amount, 0),
    color: cat.color,
    icon: cat.icon
  })).filter(item => item.value > 0);

  const otherValue = transactions.filter(t => t.type === reportType && !currentCategories.find(c => c.id === t.category)).reduce((acc, curr) => acc + curr.amount, 0);
  if (otherValue > 0) chartData.push({ name: 'Lain-lain', value: otherValue, color: '#94A3B8', icon: '🔄' });

  const totalChartValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden shadow-xl sm:border-x sm:border-slate-200">
      
      <header className="bg-white pt-8 pb-4 px-6 rounded-b-3xl shadow-sm z-10">
        <h1 className="text-2xl font-bold text-slate-800">DompetKu</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg shadow-slate-900/20">
              <p className="text-slate-400 text-sm font-medium mb-1">Total Saldo</p>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">{formatRp(balance)}</h2>
              <div className="flex justify-between gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-4 flex-1">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <div className="p-1 bg-emerald-400/10 rounded-full"><TrendingUp size={16} /></div>
                    <span className="text-xs font-semibold">Pemasukan</span>
                  </div>
                  <p className="font-semibold">{formatRp(totalIncome)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 flex-1">
                  <div className="flex items-center gap-2 text-rose-400 mb-2">
                    <div className="p-1 bg-rose-400/10 rounded-full"><TrendingDown size={16} /></div>
                    <span className="text-xs font-semibold">Pengeluaran</span>
                  </div>
                  <p className="font-semibold">{formatRp(totalExpense)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Transaksi Terakhir</h3>
              {transactions.length === 0 ? (
                <p className="text-center text-slate-500 py-8 bg-white rounded-2xl border border-slate-100">Belum ada transaksi</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(t => {
                    const catDetail = getCategoryDetail(t.type, t.category);
                    return (
                      <div key={t.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl flex items-center justify-center w-12 h-12 ${t.type === 'income' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                            <span className="text-2xl">{catDetail.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{catDetail.id}</p>
                            <p className="text-xs text-slate-500">{t.note || t.date}</p>
                          </div>
                        </div>
                        <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatRp(t.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Semua Riwayat</h2>
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Belum ada riwayat transaksi</p>
            ) : (
              transactions.map(t => {
                const catDetail = getCategoryDetail(t.type, t.category);
                return (
                  <div key={t.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100">
                     <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl flex items-center justify-center w-12 h-12 ${t.type === 'income' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        <span className="text-2xl">{catDetail.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{catDetail.id}</p>
                        <p className="text-xs text-slate-500">{t.date} {t.note && `• ${t.note}`}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatRp(t.amount)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => handleEdit(t)} className="p-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 bg-slate-50 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-5">
            
            {/* 1. KARTU MARGIN (DIPAKSA WARNANYA AGAR TIDAK PUTIH) */}
            <div className="p-6 rounded-3xl text-white shadow-lg" style={{ backgroundColor: balance >= 0 ? '#10B981' : '#F43F5E' }}>
              <p className="text-white/90 text-sm font-medium mb-1">Margin Bulan Ini (Selisih)</p>
              <h2 className="text-3xl font-bold tracking-tight">{balance >= 0 ? '+' : ''}{formatRp(balance)}</h2>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/20 shadow-sm">
                Status: {balance > 0 ? 'SURPLUS (Untung) 🎉' : balance < 0 ? 'DEFISIT (Rugi) 📉' : 'SEIMBANG ⚖️'}
              </div>
            </div>

            {/* 2. BAR ARUS KAS (DIPAKSA WARNANYA) */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3 text-sm">Ringkasan Arus Kas</h3>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-emerald-500">Masuk: {formatRp(totalIncome)}</span>
                <span className="text-rose-500">Keluar: {formatRp(totalExpense)}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${incomePercentage}%`, backgroundColor: '#10B981', transition: 'width 1s' }}></div>
                <div style={{ width: `${100 - incomePercentage}%`, backgroundColor: '#F43F5E', transition: 'width 1s' }}></div>
              </div>
            </div>

            {/* 3. GRAFIK DINAMIS (DIPAKSA UKURANNYA) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button onClick={() => setReportType('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${reportType === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}>Pengeluaran</button>
                <button onClick={() => setReportType('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${reportType === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>Pemasukan</button>
              </div>

              {chartData.length > 0 ? (
                <>
                  {/* Container grafik dipaksa tingginya menjadi 220px */}
                  <div style={{ height: '220px', position: 'relative' }} className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        {/* cx dan cy diatur ke 50% untuk memastikan lingkaran selalu di tengah */}
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatRp(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs font-semibold text-slate-400">Total {reportType === 'income' ? 'Masuk' : 'Keluar'}</span>
                      <span className={`font-bold text-sm ${reportType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatRp(totalChartValue)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    {chartData.sort((a, b) => b.value - a.value).map(cat => (
                      <div key={cat.name} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">{cat.icon}</span>
                          <div>
                            <p className="font-bold text-slate-700">{cat.name}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{((cat.value / totalChartValue) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">{formatRp(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-slate-500 font-medium">Belum ada data {reportType === 'income' ? 'pemasukan' : 'pengeluaran'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center relative z-10">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
          <Home size={24} className={activeTab === 'dashboard' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        
        <div className="relative -top-8">
          <button onClick={openModal} className="bg-slate-900 text-white p-4 rounded-full shadow-xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all">
            <Plus size={28} />
          </button>
        </div>

        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
          <List size={24} className={activeTab === 'history' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-bold">Riwayat</span>
        </button>

        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'reports' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
          <PieChart size={24} className={activeTab === 'reports' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-bold">Laporan</span>
        </button>
      </nav>

      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-[2rem] p-6 pb-12 animate-[slideUp_0.3s_ease-out] overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editId ? 'Edit Transaksi' : 'Catat Transaksi'}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense', category: 'Makanan'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income', category: 'Gaji'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>Pemasukan</button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">JUMLAH (Rp)</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors" placeholder="0" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-2 block">KATEGORI</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <button key={cat.id} type="button" onClick={() => setFormData({...formData, category: cat.id})} className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${formData.category === cat.id ? (formData.type === 'income' ? 'border-emerald-600 bg-emerald-600 text-white shadow-md' : 'border-rose-600 bg-rose-600 text-white shadow-md') : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                      <span className="text-xl mb-0.5">{cat.icon}</span>
                      <span className="text-[10px] font-semibold text-center leading-tight">{cat.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                   <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">TANGGAL</label>
                   <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">CATATAN</label>
                   <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white" placeholder="Opsional" />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold text-base py-3.5 rounded-2xl mt-2 hover:bg-slate-800 active:scale-[0.98] transition-all">
                {editId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}