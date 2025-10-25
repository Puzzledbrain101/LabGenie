import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "app.title": "AutoLab",
      "app.tagline": "Smart Laboratory Record Generator",
      "nav.export": "Export",
      "nav.save": "Save",
      "nav.rename": "Rename",
      "nav.preview": "Preview",
      "nav.logout": "Logout",
      "nav.myRecords": "My Records",
      
      // Landing
      "landing.hero.title": "Create Professional Lab Records",
      "landing.hero.subtitle": "Modern laboratory record generator with FlowCV-style editing, customizable templates, and smart export to PDF and Word.",
      "landing.cta.login": "Sign In to Get Started",
      "landing.features.editor": "Split-Screen Editor",
      "landing.features.editor.desc": "Real-time preview as you type",
      "landing.features.templates": "Pre-built Templates",
      "landing.features.templates.desc": "Physics, Chemistry, and Computer Lab",
      "landing.features.export": "Multi-Format Export",
      "landing.features.export.desc": "PDF and Word with perfect formatting",
      
      // Templates
      "template.physics": "Physics Lab",
      "template.chemistry": "Chemistry Lab",
      "template.computer": "Computer Lab",
      "template.select": "Select Template",
      
      // Sections
      "section.studentDetails": "Student Details",
      "section.aim": "Aim",
      "section.apparatus": "Apparatus",
      "section.theory": "Theory",
      "section.procedure": "Procedure",
      "section.code": "Code",
      "section.output": "Output",
      "section.observations": "Observations",
      "section.results": "Results",
      "section.conclusion": "Conclusion",
      "section.add": "Add Section",
      "section.hide": "Hide Section",
      "section.show": "Show Section",
      "section.delete": "Delete Section",
      "section.rename": "Rename Section",
      
      // Student Details Fields
      "field.name": "Name",
      "field.rollNo": "Roll No",
      "field.class": "Class",
      "field.date": "Date",
      "field.subject": "Subject",
      "field.batch": "Batch",
      
      // Customization
      "custom.title": "Customization",
      "custom.font": "Font",
      "custom.theme": "Theme",
      "custom.layout": "Layout",
      "custom.colors": "Color Scheme",
      "custom.header": "Header & Logo",
      "theme.academic": "Academic",
      "theme.modern": "Modern",
      "theme.minimal": "Minimal",
      "layout.portrait": "Portrait",
      "layout.landscape": "Landscape",
      
      // Export
      "export.title": "Export Lab Record",
      "export.format": "Format",
      "export.pdf": "PDF Document",
      "export.docx": "Word Document",
      "export.settings": "Export Settings",
      "export.pageSize": "Page Size",
      "export.orientation": "Orientation",
      "export.includeHeader": "Include Header",
      "export.fileName": "File Name",
      "export.download": "Download",
      "export.cancel": "Cancel",
      
      // File Management
      "file.new": "New Record",
      "file.duplicate": "Duplicate",
      "file.delete": "Delete",
      "file.rename": "Rename",
      "file.search": "Search records...",
      "file.filter": "Filter",
      "file.all": "All Records",
      
      // Media
      "media.upload": "Upload Image",
      "media.dragDrop": "Drag and drop or click to upload",
      "media.caption": "Caption",
      "media.alignment": "Alignment",
      "media.size": "Size",
      "media.left": "Left",
      "media.center": "Center",
      "media.right": "Right",
      
      // Messages
      "msg.saved": "Record saved",
      "msg.saving": "Saving...",
      "msg.exported": "Exported successfully",
      "msg.deleted": "Record deleted",
      "msg.duplicated": "Record duplicated",
      "msg.error": "An error occurred",
      "msg.loading": "Loading...",
      "msg.noRecords": "No records yet",
      "msg.createFirst": "Create your first lab record to get started",
      
      // Common
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.close": "Close",
    }
  },
  de: {
    translation: {
      // Navigation
      "app.title": "AutoLab",
      "app.tagline": "Intelligenter Laborberichtgenerator",
      "nav.export": "Exportieren",
      "nav.save": "Speichern",
      "nav.rename": "Umbenennen",
      "nav.preview": "Vorschau",
      "nav.logout": "Abmelden",
      "nav.myRecords": "Meine Berichte",
      
      // Landing
      "landing.hero.title": "Professionelle Laborberichte Erstellen",
      "landing.hero.subtitle": "Moderner Laborberichtgenerator mit FlowCV-Style-Bearbeitung, anpassbaren Vorlagen und intelligenten Export nach PDF und Word.",
      "landing.cta.login": "Anmelden um zu Beginnen",
      "landing.features.editor": "Split-Screen Editor",
      "landing.features.editor.desc": "Echtzeit-Vorschau beim Tippen",
      "landing.features.templates": "Vorgefertigte Vorlagen",
      "landing.features.templates.desc": "Physik, Chemie und Computerlabor",
      "landing.features.export": "Multi-Format Export",
      "landing.features.export.desc": "PDF und Word mit perfekter Formatierung",
      
      // Templates
      "template.physics": "Physiklabor",
      "template.chemistry": "Chemielabor",
      "template.computer": "Computerlabor",
      "template.select": "Vorlage Auswählen",
      
      // Sections
      "section.studentDetails": "Studentendetails",
      "section.aim": "Ziel",
      "section.apparatus": "Apparat",
      "section.theory": "Theorie",
      "section.procedure": "Verfahren",
      "section.code": "Code",
      "section.output": "Ausgabe",
      "section.observations": "Beobachtungen",
      "section.results": "Ergebnisse",
      "section.conclusion": "Schlussfolgerung",
      "section.add": "Abschnitt Hinzufügen",
      "section.hide": "Ausblenden",
      "section.show": "Einblenden",
      "section.delete": "Löschen",
      "section.rename": "Umbenennen",
      
      // Student Details Fields
      "field.name": "Name",
      "field.rollNo": "Matrikelnr",
      "field.class": "Klasse",
      "field.date": "Datum",
      "field.subject": "Fach",
      "field.batch": "Gruppe",
      
      // Customization
      "custom.title": "Anpassung",
      "custom.font": "Schriftart",
      "custom.theme": "Thema",
      "custom.layout": "Layout",
      "custom.colors": "Farbschema",
      "custom.header": "Kopfzeile & Logo",
      "theme.academic": "Akademisch",
      "theme.modern": "Modern",
      "theme.minimal": "Minimal",
      "layout.portrait": "Hochformat",
      "layout.landscape": "Querformat",
      
      // Export
      "export.title": "Laborbericht Exportieren",
      "export.format": "Format",
      "export.pdf": "PDF-Dokument",
      "export.docx": "Word-Dokument",
      "export.settings": "Exporteinstellungen",
      "export.pageSize": "Seitengröße",
      "export.orientation": "Ausrichtung",
      "export.includeHeader": "Kopfzeile Einschließen",
      "export.fileName": "Dateiname",
      "export.download": "Herunterladen",
      "export.cancel": "Abbrechen",
      
      // File Management
      "file.new": "Neuer Bericht",
      "file.duplicate": "Duplizieren",
      "file.delete": "Löschen",
      "file.rename": "Umbenennen",
      "file.search": "Berichte Suchen...",
      "file.filter": "Filtern",
      "file.all": "Alle Berichte",
      
      // Media
      "media.upload": "Bild Hochladen",
      "media.dragDrop": "Ziehen und Ablegen oder Klicken zum Hochladen",
      "media.caption": "Beschriftung",
      "media.alignment": "Ausrichtung",
      "media.size": "Größe",
      "media.left": "Links",
      "media.center": "Zentriert",
      "media.right": "Rechts",
      
      // Messages
      "msg.saved": "Bericht Gespeichert",
      "msg.saving": "Speichert...",
      "msg.exported": "Erfolgreich Exportiert",
      "msg.deleted": "Bericht Gelöscht",
      "msg.duplicated": "Bericht Dupliziert",
      "msg.error": "Ein Fehler ist Aufgetreten",
      "msg.loading": "Lädt...",
      "msg.noRecords": "Noch Keine Berichte",
      "msg.createFirst": "Erstelle deinen ersten Laborbericht",
      
      // Common
      "common.cancel": "Abbrechen",
      "common.save": "Speichern",
      "common.delete": "Löschen",
      "common.edit": "Bearbeiten",
      "common.close": "Schließen",
    }
  },
  es: {
    translation: {
      // Navigation
      "app.title": "AutoLab",
      "app.tagline": "Generador Inteligente de Registros de Laboratorio",
      "nav.export": "Exportar",
      "nav.save": "Guardar",
      "nav.rename": "Renombrar",
      "nav.preview": "Vista Previa",
      "nav.logout": "Cerrar Sesión",
      "nav.myRecords": "Mis Registros",
      
      // Landing
      "landing.hero.title": "Crea Registros de Laboratorio Profesionales",
      "landing.hero.subtitle": "Generador moderno de registros de laboratorio con edición estilo FlowCV, plantillas personalizables y exportación inteligente a PDF y Word.",
      "landing.cta.login": "Iniciar Sesión para Comenzar",
      "landing.features.editor": "Editor de Pantalla Dividida",
      "landing.features.editor.desc": "Vista previa en tiempo real mientras escribes",
      "landing.features.templates": "Plantillas Predefinidas",
      "landing.features.templates.desc": "Física, Química y Laboratorio de Computación",
      "landing.features.export": "Exportación Multi-Formato",
      "landing.features.export.desc": "PDF y Word con formato perfecto",
      
      // Templates
      "template.physics": "Laboratorio de Física",
      "template.chemistry": "Laboratorio de Química",
      "template.computer": "Laboratorio de Computación",
      "template.select": "Seleccionar Plantilla",
      
      // Sections
      "section.studentDetails": "Detalles del Estudiante",
      "section.aim": "Objetivo",
      "section.apparatus": "Aparatos",
      "section.theory": "Teoría",
      "section.procedure": "Procedimiento",
      "section.code": "Código",
      "section.output": "Salida",
      "section.observations": "Observaciones",
      "section.results": "Resultados",
      "section.conclusion": "Conclusión",
      "section.add": "Agregar Sección",
      "section.hide": "Ocultar Sección",
      "section.show": "Mostrar Sección",
      "section.delete": "Eliminar Sección",
      "section.rename": "Renombrar Sección",
      
      // Student Details Fields
      "field.name": "Nombre",
      "field.rollNo": "No. de Lista",
      "field.class": "Clase",
      "field.date": "Fecha",
      "field.subject": "Materia",
      "field.batch": "Grupo",
      
      // Customization
      "custom.title": "Personalización",
      "custom.font": "Fuente",
      "custom.theme": "Tema",
      "custom.layout": "Diseño",
      "custom.colors": "Esquema de Colores",
      "custom.header": "Encabezado y Logo",
      "theme.academic": "Académico",
      "theme.modern": "Moderno",
      "theme.minimal": "Minimalista",
      "layout.portrait": "Vertical",
      "layout.landscape": "Horizontal",
      
      // Export
      "export.title": "Exportar Registro de Laboratorio",
      "export.format": "Formato",
      "export.pdf": "Documento PDF",
      "export.docx": "Documento Word",
      "export.settings": "Configuración de Exportación",
      "export.pageSize": "Tamaño de Página",
      "export.orientation": "Orientación",
      "export.includeHeader": "Incluir Encabezado",
      "export.fileName": "Nombre de Archivo",
      "export.download": "Descargar",
      "export.cancel": "Cancelar",
      
      // File Management
      "file.new": "Nuevo Registro",
      "file.duplicate": "Duplicar",
      "file.delete": "Eliminar",
      "file.rename": "Renombrar",
      "file.search": "Buscar registros...",
      "file.filter": "Filtrar",
      "file.all": "Todos los Registros",
      
      // Media
      "media.upload": "Subir Imagen",
      "media.dragDrop": "Arrastra y suelta o haz clic para subir",
      "media.caption": "Leyenda",
      "media.alignment": "Alineación",
      "media.size": "Tamaño",
      "media.left": "Izquierda",
      "media.center": "Centro",
      "media.right": "Derecha",
      
      // Messages
      "msg.saved": "Registro Guardado",
      "msg.saving": "Guardando...",
      "msg.exported": "Exportado Exitosamente",
      "msg.deleted": "Registro Eliminado",
      "msg.duplicated": "Registro Duplicado",
      "msg.error": "Ocurrió un Error",
      "msg.loading": "Cargando...",
      "msg.noRecords": "Aún No Hay Registros",
      "msg.createFirst": "Crea tu primer registro de laboratorio para comenzar",
      
      // Common
      "common.cancel": "Cancelar",
      "common.save": "Guardar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.close": "Cerrar",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
