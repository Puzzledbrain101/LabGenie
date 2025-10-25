import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FlaskConical, Download, Save, Eye, Menu, Check, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ExportDialog } from '@/components/export-dialog';
import { FileSidebar } from '@/components/file-sidebar';
import { useAuth } from '@/hooks/useAuth';

import type { Section } from '@shared/schema';

interface NavbarProps {
  recordTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPreviewToggle: () => void;
  isSaving: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  isPreviewMode: boolean;
  sections: Section[];
}

export function Navbar({
  recordTitle,
  onTitleChange,
  onSave,
  onPreviewToggle,
  isSaving,
  saveStatus,
  isPreviewMode,
  sections,
}: NavbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur-sm">
        <div className="h-full px-6 flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-foreground">{t('app.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('app.tagline')}</p>
              </div>
            </div>
          </div>

          {/* Center Section - Title */}
          <div className="flex-1 max-w-md mx-4 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={recordTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="w-full px-3 py-1.5 text-base font-medium text-foreground bg-transparent border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
                data-testid="input-record-title"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="w-full px-3 py-1.5 text-base font-medium text-foreground text-left truncate hover-elevate rounded-md transition-colors"
                data-testid="button-edit-title"
              >
                {recordTitle || t('file.new')}
              </button>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Save Status */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground min-w-[80px]">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span data-testid="text-save-status">{t('msg.saving')}</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="h-3 w-3 text-primary" />
                  <span data-testid="text-save-status">{t('msg.saved')}</span>
                </>
              )}
            </div>

            <LanguageSwitcher />

            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviewToggle}
              className="gap-2 hidden lg:flex"
              data-testid="button-preview-toggle"
            >
              <Eye className="h-4 w-4" />
              {t('nav.preview')}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="gap-2"
              disabled={isSaving}
              data-testid="button-save"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.save')}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setExportOpen(true)}
              className="gap-2"
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.export')}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        recordTitle={recordTitle}
        sections={sections}
      />

      <FileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
