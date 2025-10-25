import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, FileText, Loader2 } from 'lucide-react';
import type { LabRecord } from '@shared/schema';

interface FileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordSelect?: (recordId: string) => void;
}

export function FileSidebar({ open, onOpenChange, onRecordSelect }: FileSidebarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: records, isLoading } = useQuery<LabRecord[]>({
    queryKey: ['/api/lab-records'],
    enabled: open,
  });

  const filteredRecords = records?.filter((record) =>
    record.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createRecordMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/lab-records', {
        title: 'New Lab Record',
        templateType: 'physics',
      });
    },
    onSuccess: (newRecord: LabRecord) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-records'] });
      toast({
        title: t('msg.saved'),
        description: 'New record created',
      });
      if (onRecordSelect) {
        onRecordSelect(newRecord.id);
      }
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: t('msg.error'),
        description: 'Failed to create record',
        variant: 'destructive',
      });
    },
  });

  const duplicateRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      return await apiRequest('POST', `/api/lab-records/${recordId}/duplicate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-records'] });
      toast({
        title: t('msg.duplicated'),
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await apiRequest('DELETE', `/api/lab-records/${recordId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-records'] });
      toast({
        title: t('msg.deleted'),
      });
    },
  });

  const handleCreateNew = () => {
    createRecordMutation.mutate();
  };

  const handleSelectRecord = (recordId: string) => {
    if (onRecordSelect) {
      onRecordSelect(recordId);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>{t('nav.myRecords')}</SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-4">
          {/* New Record Button */}
          <Button
            onClick={handleCreateNew}
            className="w-full gap-2"
            data-testid="button-new-record"
          >
            <Plus className="h-4 w-4" />
            {t('file.new')}
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('file.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-records"
            />
          </div>
        </div>

        {/* Records List */}
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="px-6 pb-6 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRecords && filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer group"
                  onClick={() => handleSelectRecord(record.id)}
                  data-testid={`card-record-${record.id}`}
                >
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{record.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {t(`template.${record.templateType}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.updatedAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateRecordMutation.mutate(record.id);
                        }}
                        data-testid={`button-duplicate-${record.id}`}
                      >
                        {t('file.duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecordMutation.mutate(record.id);
                        }}
                        className="text-destructive" 
                        data-testid={`button-delete-${record.id}`}
                      >
                        {t('file.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t('msg.noRecords')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('msg.createFirst')}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
