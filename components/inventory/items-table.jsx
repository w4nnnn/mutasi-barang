'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toNumber } from '@/lib/formatters';

export default function ItemsTable({
  items,
  loading,
  itemForm,
  creatingItem,
  onItemSubmit,
  onItemInputChange,
  maxItems,
}) {
  const [open, setOpen] = useState(false);
  const displayedItems = maxItems ? items.slice(0, maxItems) : items;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onItemSubmit(event);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Daftar Barang</CardTitle>
          <CardDescription>Data master barang dan stok terkini.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Tambah Barang</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Barang Baru</DialogTitle>
                <DialogDescription>Lengkapi data berikut untuk menambahkan barang ke master stok.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="item-code">Kode Barang</Label>
                  <Input
                    id="item-code"
                    name="code"
                    placeholder="Contoh: OL-001"
                    value={itemForm.code}
                    onChange={onItemInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-name">Nama Barang</Label>
                  <Input
                    id="item-name"
                    name="name"
                    placeholder="Nama barang"
                    value={itemForm.name}
                    onChange={onItemInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-stock">Stok Awal</Label>
                  <Input
                    id="item-stock"
                    name="stock"
                    type="number"
                    min={0}
                    value={itemForm.stock}
                    onChange={onItemInputChange}
                  />
                </div>
                <DialogFooter className="md:col-span-2 gap-2 sm:gap-3">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={creatingItem}>
                    {creatingItem ? 'Menyimpan...' : 'Simpan Barang'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Badge variant="secondary">{items.length} Barang</Badge>
        </div>
      </CardHeader>
      <Separator className="bg-border/80" />
      <CardContent className="px-0">
        <div className="max-h-[480px] overflow-auto px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead className="text-center">Nama</TableHead>
                <TableHead className="text-right">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    Memuat data barang...
                  </TableCell>
                </TableRow>
              ) : displayedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    Belum ada data barang.
                  </TableCell>
                </TableRow>
              ) : (
                displayedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.code}</TableCell>
                    <TableCell className="text-center">{item.name}</TableCell>
                    <TableCell className="text-right">
                      <span className={toNumber(item.stock) <= 5 ? 'font-semibold text-destructive' : ''}>
                        {item.stock}
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
  );
}
