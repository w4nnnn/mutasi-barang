'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export default function MutationPanel({
  items,
  mutationForm,
  selectedItem,
  creatingMutation,
  loadingItems,
  onMutationSubmit,
  onMutationInputChange,
  onMutationItemChange,
  onMutationTypeChange,
}) {
  const [open, setOpen] = useState(false);
  const canCreate = items.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onMutationSubmit(event);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Mutasi Stok Barang</CardTitle>
          <CardDescription>Gunakan dialog untuk mencatat barang masuk atau keluar.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreate || loadingItems}>Catat Mutasi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Mutasi Barang</DialogTitle>
              <DialogDescription>Pilih barang dan isi detail mutasi yang ingin dicatat.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="mutation-item">Barang</Label>
                <Select value={mutationForm.itemId} onValueChange={onMutationItemChange}>
                  <SelectTrigger id="mutation-item" className="w-full">
                    <SelectValue placeholder="Pilih barang" />
                  </SelectTrigger>
                  <SelectContent align="start" className="w-[--radix-select-trigger-width]">
                    {items.length === 0 && (
                      <SelectItem value="__placeholder__" disabled>
                        Belum ada barang
                      </SelectItem>
                    )}
                    {items.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.code} — {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mutation-type">Jenis Mutasi</Label>
                <Select value={mutationForm.type} onValueChange={onMutationTypeChange}>
                  <SelectTrigger id="mutation-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="w-[--radix-select-trigger-width]">
                    <SelectItem value="masuk">Barang Masuk</SelectItem>
                    <SelectItem value="keluar">Barang Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mutation-quantity">Jumlah</Label>
                <Input
                  id="mutation-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  required
                  value={mutationForm.quantity}
                  onChange={onMutationInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mutation-note">Catatan</Label>
                <Input
                  id="mutation-note"
                  name="note"
                  placeholder="Opsional"
                  value={mutationForm.note}
                  onChange={onMutationInputChange}
                />
              </div>

              {selectedItem && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Ringkasan Barang Terpilih</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <span>
                      Kode: <strong>{selectedItem.code}</strong>
                    </span>
                    <span>
                      Nama: <strong>{selectedItem.name}</strong>
                    </span>
                    <span>
                      Stok Saat Ini: <strong>{selectedItem.stock}</strong>
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={creatingMutation || loadingItems}>
                  {creatingMutation ? 'Menyimpan...' : 'Simpan Mutasi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {canCreate
            ? 'Pantau stok dan catat setiap mutasi agar data persediaan selalu akurat.'
            : 'Belum ada barang yang terdaftar. Tambahkan barang terlebih dahulu sebelum mencatat mutasi.'}
        </p>
      </CardContent>
    </Card>
  );
}
