import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { SectionItem } from '@/components/section-item';
import type { Section } from '@shared/schema';

interface SectionManagerProps {
  sections: Section[];
  activeSectionId: string | null;
  onSectionsChange: (sections: Section[]) => void;
  onSectionSelect: (sectionId: string) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onSectionDelete: (sectionId: string) => void;
  onAddSection: () => void;
}

export function SectionManager({
  sections,
  activeSectionId,
  onSectionsChange,
  onSectionSelect,
  onSectionUpdate,
  onSectionDelete,
  onAddSection,
}: SectionManagerProps) {
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      }));

      onSectionsChange(newSections);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  isActive={section.id === activeSectionId}
                  onSelect={() => onSectionSelect(section.id)}
                  onUpdate={(updates) => onSectionUpdate(section.id, updates)}
                  onDelete={() => onSectionDelete(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onAddSection}
          data-testid="button-add-section"
        >
          <Plus className="h-4 w-4" />
          {t('section.add')}
        </Button>
      </div>
    </div>
  );
}
