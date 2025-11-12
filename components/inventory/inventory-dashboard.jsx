'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, toNumber } from '@/lib/formatters';
import MutationPanel from '@/components/inventory/mutation-panel';
import ItemsTable from '@/components/inventory/items-table';

export default function InventoryDashboard({ activeView = 'dashboard' }) {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [creatingItem, setCreatingItem] = useState(false);
  const [creatingMutation, setCreatingMutation] = useState(false);

  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    stock: '',
  });

  const [mutationForm, setMutationForm] = useState({
    itemId: '',
    type: 'masuk',
    quantity: '',
    note: '',
  });

  const handleMutationItemChange = (value) => {
    setMutationForm((prev) => ({
      ...prev,
      itemId: value,
    }));
  };

  const handleMutationTypeChange = (value) => {
    setMutationForm((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalStock = items.reduce((acc, item) => acc + toNumber(item.stock), 0);
    const lowStockItems = items.filter((item) => toNumber(item.stock) <= 5).length;

    return {
      totalItems,
      totalStock,
      lowStockItems,
    };
  }, [items]);

  const loadItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const response = await fetch('/api/items', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Gagal mengambil data barang');
      }
      const result = await response.json();
      setItems(result.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error(error.message ?? 'Terjadi kesalahan saat memuat barang');
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const response = await fetch('/api/transactions?limit=20', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Gagal mengambil data mutasi');
      }
      const result = await response.json();
      setTransactions(result.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error(error.message ?? 'Terjadi kesalahan saat memuat mutasi');
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
    loadTransactions();
  }, [loadItems, loadTransactions]);

  const handleItemInputChange = (event) => {
    const { name, value } = event.target;
    setItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateItem = async (event) => {
    event?.preventDefault?.();
    if (!itemForm.code.trim() || !itemForm.name.trim()) {
      toast.error('Kode dan nama barang wajib diisi');
      return false;
    }

    const payload = {
      kodeBarang: itemForm.code,
      namaBarang: itemForm.name,
      initialStock: Number(itemForm.stock || 0),
    };

    if (payload.initialStock < 0) {
      toast.error('Stok awal tidak boleh negatif');
      return false;
    }

    let success = false;

    try {
      setCreatingItem(true);
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Gagal menyimpan barang');
      }

  toast.success('Barang berhasil ditambahkan');
  setItemForm({ code: '', name: '', stock: '' });
      setMutationForm((prev) => ({ ...prev, itemId: String(result.data?.id ?? '') }));

      await loadItems();
      await loadTransactions();

      success = true;
    } catch (error) {
      console.error(error);
      toast.error(error.message ?? 'Gagal menyimpan barang');
    } finally {
      setCreatingItem(false);
    }

    return success;
  };

  const handleMutationInputChange = (event) => {
    const { name, value } = event.target;
    setMutationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateMutation = async (event) => {
    event.preventDefault();
    if (!mutationForm.itemId) {
      toast.error('Silakan pilih barang terlebih dahulu');
      return false;
    }

    const payload = {
      itemId: Number(mutationForm.itemId),
      type: mutationForm.type,
      quantity: Number(mutationForm.quantity || 0),
      note: mutationForm.note.trim() ? mutationForm.note : undefined,
    };

    if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) {
      toast.error('Jumlah harus lebih dari nol');
      return false;
    }

    let success = false;

    try {
      setCreatingMutation(true);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Gagal menyimpan mutasi barang');
      }

      toast.success('Mutasi barang berhasil disimpan');
      setMutationForm((prev) => ({
        ...prev,
        quantity: '',
        note: '',
      }));

      await loadItems();
      await loadTransactions();

      success = true;
    } catch (error) {
      console.error(error);
      toast.error(error.message ?? 'Gagal menyimpan mutasi barang');
    } finally {
      setCreatingMutation(false);
    }

    return success;
  };

  const selectedItem = useMemo(() => {
    if (!mutationForm.itemId) {
      return null;
    }
    return items.find((item) => String(item.id) === String(mutationForm.itemId)) ?? null;
  }, [items, mutationForm.itemId]);

  const showSummary = activeView === 'dashboard';
  const showMutationPanel = activeView === 'dashboard' || activeView === 'mutations';
  const showItemsTable = activeView === 'dashboard' || activeView === 'items';
  const showTransactions = activeView === 'dashboard' || activeView === 'mutations';

  const headingTitle = {
    dashboard: 'Dashboard Stok Barang',
    items: 'Daftar Stok Barang',
    mutations: 'Kelola Mutasi Barang',
  }[activeView] ?? 'Dashboard Stok Barang';

  const headingDescription = {
    dashboard: 'Kelola stok, catat mutasi keluar-masuk, dan awasi barang dengan stok menipis secara cepat.',
    items: 'Lihat stok terkini, harga, dan status ketersediaan setiap barang.',
    mutations: 'Catat barang masuk/keluar serta pantau riwayat mutasi terbaru.',
  }[activeView] ?? 'Kelola stok, catat mutasi keluar-masuk, dan awasi barang dengan stok menipis secara cepat.';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{headingTitle}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{headingDescription}</p>
      </header>

      {showSummary && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Barang</CardTitle>
              <CardDescription>Jumlah SKU yang terdaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.totalItems}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Stok</CardTitle>
              <CardDescription>Akumulasi unit tersedia</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.totalStock}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stok Menipis</CardTitle>
              <CardDescription>Barang dengan stok &le; 5</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.lowStockItems}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {showMutationPanel && (
        <MutationPanel
          items={items}
          mutationForm={mutationForm}
          selectedItem={selectedItem}
          creatingMutation={creatingMutation}
          loadingItems={loadingItems}
          onMutationSubmit={handleCreateMutation}
          onMutationInputChange={handleMutationInputChange}
          onMutationItemChange={handleMutationItemChange}
          onMutationTypeChange={handleMutationTypeChange}
        />
      )}

      {(showItemsTable || showTransactions) && (
  <section className={showItemsTable && showTransactions ? 'grid gap-6 lg:grid-cols-2' : 'grid gap-6'}>
          {showItemsTable && (
            <ItemsTable
              items={items}
              loading={loadingItems}
              itemForm={itemForm}
              creatingItem={creatingItem}
              onItemSubmit={handleCreateItem}
              onItemInputChange={handleItemInputChange}
              maxItems={activeView === 'dashboard' ? 20 : undefined}
            />
          )}

          {showTransactions && (
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Riwayat Mutasi</CardTitle>
                    <CardDescription>20 mutasi terakhir barang masuk/keluar.</CardDescription>
                  </div>
                  <Badge variant="outline">Terbaru</Badge>
                </div>
              </CardHeader>
              <Separator className="bg-border/80" />
              <CardContent className="px-0">
                <div className="max-h-[480px] overflow-auto px-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Barang</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingTransactions ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                            Memuat data mutasi...
                          </TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                            Belum ada mutasi barang.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((mutation) => (
                          <TableRow key={mutation.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {mutation.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}
                                </span>
                                <span className="text-xs text-muted-foreground">{formatDateTime(mutation.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{mutation.itemName}</span>
                                <span className="text-xs text-muted-foreground">{mutation.itemCode}</span>
                                {mutation.note && (
                                  <span className="text-xs text-muted-foreground">{mutation.note}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={mutation.type === 'keluar' ? 'font-semibold text-destructive' : 'font-semibold text-emerald-600'}>
                                {mutation.type === 'keluar' ? '-' : '+'}{mutation.quantity}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
