import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, MoreVertical, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react';
import type { Section } from '@shared/schema';

interface SectionItemProps {
  section: Section;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
}

export function SectionItem({ section, isActive, onSelect, onUpdate, onDelete }: SectionItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== section.title) {
      onUpdate({ title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
        isActive ? 'bg-accent border-primary' : 'bg-card hover-elevate'
      } ${section.isHidden ? 'opacity-60' : ''}`}
      data-testid={`section-item-${section.id}`}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        data-testid={`drag-handle-${section.id}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Section Title */}
      <div className="flex-1 min-w-0" onClick={onSelect}>
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setEditTitle(section.title);
                setIsEditing(false);
              }
            }}
            className="h-7 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            data-testid={`input-section-title-${section.id}`}
          />
        ) : (
          <p className={`text-sm font-medium truncate cursor-pointer ${section.isHidden ? 'line-through' : ''}`}>
            {section.title}
          </p>
        )}
      </div>

      {/* Hidden Indicator */}
      {section.isHidden && (
        <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isHidden: !section.isHidden });
            }}
            data-testid={`button-toggle-visibility-${section.id}`}
          >
            {section.isHidden ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                {t('section.show')}
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                {t('section.hide')}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            data-testid={`button-rename-${section.id}`}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {t('section.rename')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-destructive"
            data-testid={`button-delete-section-${section.id}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('section.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
