"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Link2,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  Undo,
  Redo,
  RemoveFormatting,
  Code,
  Eye,
  Maximize2,
  Minimize2,
  Palette,
  Highlighter,
  Upload,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  label?: string;
}

const FONT_FAMILIES = [
  { name: "Default (Sans-serif)", value: "inherit" },
  { name: "Serif (Editorial)", value: "'Merriweather', Georgia, serif" },
  { name: "Monospace (Code)", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Arial / Helvetica", value: "Arial, Helvetica, sans-serif" },
];

const FONT_SIZES = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px (Normal)", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
];

const COLOR_PRESETS = [
  { name: "Default", color: "#1F2937" },
  { name: "Plum Brand", color: "#4A154B" },
  { name: "Blue", color: "#2563EB" },
  { name: "Emerald", color: "#059669" },
  { name: "Crimson", color: "#DC2626" },
  { name: "Amber", color: "#D97706" },
  { name: "Purple", color: "#7C3AED" },
  { name: "Muted Gray", color: "#6B7280" },
];

const HIGHLIGHT_PRESETS = [
  { name: "None", color: "transparent" },
  { name: "Yellow", color: "#FEF08A" },
  { name: "Green", color: "#BBF7D0" },
  { name: "Blue", color: "#BFDBFE" },
  { name: "Peach", color: "#FED7AA" },
  { name: "Pink", color: "#FBCFE8" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your document content here...",
  minHeight = "360px",
  className = "",
  label,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Popups & Dialogs
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  // Link state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(false);

  // Image state
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);

  // Active heading & font state for UI display
  const [currentBlock, setCurrentBlock] = useState("p");
  const [currentFontSize, setCurrentFontSize] = useState("16px");
  const [currentFontFamily, setCurrentFontFamily] = useState("inherit");

  // Sync external value to visual editor when not actively typing inside it
  useEffect(() => {
    if (mode === "visual" && editorRef.current) {
      if (document.activeElement !== editorRef.current) {
        if (editorRef.current.innerHTML !== (value || "")) {
          editorRef.current.innerHTML = value || "";
        }
      }
    }
  }, [value, mode]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  const handleEditorChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const cleanHtml = html === "<p><br></p>" || html === "<br>" ? "" : html;
    onChange(cleanHtml);
  }, [onChange]);

  const exec = (command: string, val: string | undefined = undefined) => {
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.focus();
    try {
      document.execCommand(command, false, val);
    } catch (e) {
      console.warn("execCommand failed:", command, e);
    }
    handleEditorChange();
  };

  // Block format (Headings & Paragraphs)
  const handleFormatBlock = (tag: string) => {
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.focus();
    try {
      document.execCommand("formatBlock", false, `<${tag}>`);
    } catch {
      document.execCommand("formatBlock", false, tag);
    }
    setCurrentBlock(tag);
    handleEditorChange();
  };

  // Font Size
  const handleApplyFontSize = (size: string) => {
    setCurrentFontSize(size);
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = size;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    handleEditorChange();
  };

  // Font Family
  const handleApplyFontFamily = (family: string) => {
    setCurrentFontFamily(family);
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontFamily = family;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    handleEditorChange();
  };

  // Text Color
  const handleApplyColor = (colorHex: string) => {
    exec("foreColor", colorHex);
    setShowColorPicker(false);
  };

  // Highlight Color
  const handleApplyHighlight = (colorHex: string) => {
    if (colorHex === "transparent") {
      exec("removeFormat");
    } else {
      try {
        exec("hiliteColor", colorHex);
      } catch {
        exec("backColor", colorHex);
      }
    }
    setShowHighlightPicker(false);
  };

  // Link Dialog Open
  const openLinkDialog = () => {
    saveSelection();
    const sel = window.getSelection();
    const text = sel ? sel.toString() : "";
    setLinkText(text);
    setLinkUrl("");
    setLinkOpenNewTab(false);
    setShowLinkDialog(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelection();

    if (linkText.trim()) {
      const a = `<a href="${linkUrl.trim()}" ${
        linkOpenNewTab ? 'target="_blank" rel="noopener noreferrer"' : ""
      } class="text-primary underline hover:text-primary/80 font-medium">${linkText.trim()}</a>`;
      exec("insertHTML", a);
    } else {
      exec("createLink", linkUrl.trim());
    }

    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleUnlink = () => {
    exec("unlink");
  };

  // Image Upload & Insert
  const openImageDialog = () => {
    saveSelection();
    setImageUrl("");
    setImageAlt("");
    setImageUploadError("");
    setShowImageDialog(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "content");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        setImageUploadError(data.message || "Upload failed");
      }
    } catch (err: any) {
      setImageUploadError(err.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    restoreSelection();

    const imageHtml = `
      <figure class="my-4 text-center">
        <img src="${imageUrl.trim()}" alt="${imageAlt.trim()}" class="rounded-2xl max-w-full h-auto inline-block border border-border shadow-xs my-1" style="max-height: 480px;" />
        ${
          imageAlt.trim()
            ? `<figcaption class="text-xs text-muted-foreground mt-1.5 text-center italic">${imageAlt.trim()}</figcaption>`
            : ""
        }
      </figure>
      <p><br></p>
    `;

    try {
      exec("insertHTML", imageHtml);
    } catch {
      if (editorRef.current) {
        editorRef.current.innerHTML += imageHtml;
      }
    }

    setShowImageDialog(false);
    setImageUrl("");
    setImageAlt("");
  };

  // Table Insert
  const openTableDialog = () => {
    saveSelection();
    setTableRows(3);
    setTableCols(3);
    setTableHasHeader(true);
    setShowTableDialog(true);
  };

  const handleInsertTable = () => {
    restoreSelection();

    let tableHtml = `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">`;

    if (tableHasHeader && tableRows > 0) {
      tableHtml += `<thead><tr class="bg-gray-100 dark:bg-gray-800">`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<th class="border border-gray-300 dark:border-gray-700 p-2.5 text-left font-bold text-foreground">Header ${c}</th>`;
      }
      tableHtml += `</tr></thead>`;
    }

    tableHtml += `<tbody>`;
    const startRow = tableHasHeader ? 2 : 1;
    for (let r = startRow; r <= tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td class="border border-gray-300 dark:border-gray-700 p-2 text-foreground">Cell (${r}, ${c})</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table></div><p><br></p>`;

    try {
      exec("insertHTML", tableHtml);
    } catch {
      if (editorRef.current) {
        editorRef.current.innerHTML += tableHtml;
      }
    }

    setShowTableDialog(false);
  };

  // Pre-styled Helper Blocks
  const handleInsertAlert = () => {
    if (mode !== "visual" || !editorRef.current) return;
    editorRef.current.focus();
    const alertHtml = `
      <div class="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-sm my-3 font-sans">
        <strong>Important Notice:</strong> Add your highlighted policy details or advisory here.
      </div>
      <p><br></p>
    `;
    try {
      exec("insertHTML", alertHtml);
    } catch {
      if (editorRef.current) {
        editorRef.current.innerHTML += alertHtml;
      }
    }
    handleEditorChange();
  };

  // Word & character counts
  const textOnly = (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textOnly ? textOnly.split(/\s+/).length : 0;
  const charCount = textOnly.length;

  return (
    <div
      className={`space-y-2 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background p-6 flex flex-col overflow-hidden"
          : className
      }`}
    >
      {/* Label and Top Mode Switcher */}
      <div className="flex items-center justify-between">
        {label ? (
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>{label}</span>
            {isFullscreen && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-normal">
                Fullscreen Document View
              </span>
            )}
          </label>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === "visual" ? "code" : "visual")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border shadow-2xs"
          >
            {mode === "visual" ? (
              <>
                <Code className="w-3.5 h-3.5 text-primary" />
                <span>HTML Code Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>Visual Document Editor</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            className="p-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`rounded-2xl border border-border bg-background shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all flex flex-col ${
          isFullscreen ? "flex-1" : ""
        }`}
      >
        {/* Toolbar */}
        <div className="p-2 border-b border-border bg-muted/40 flex flex-wrap items-center gap-1 text-muted-foreground select-none relative">
          {mode === "visual" ? (
            <>
              {/* Undo / Redo */}
              <div className="flex items-center gap-0.5 pr-1 border-r border-border/70">
                <button
                  type="button"
                  title="Undo (Ctrl+Z)"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("undo");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Redo (Ctrl+Y)"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("redo");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* Headings & Paragraph Selector */}
              <div className="flex items-center gap-1 px-1 border-r border-border/70">
                <select
                  value={currentBlock}
                  onChange={(e) => handleFormatBlock(e.target.value)}
                  className="h-8 px-2 text-xs font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none cursor-pointer"
                  title="Paragraph & Headings"
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1 (H1)</option>
                  <option value="h2">Heading 2 (H2)</option>
                  <option value="h3">Heading 3 (H3)</option>
                  <option value="h4">Heading 4 (H4)</option>
                  <option value="h5">Heading 5 (H5)</option>
                  <option value="h6">Heading 6 (H6)</option>
                  <option value="blockquote">Quote</option>
                  <option value="pre">Code Block</option>
                </select>
              </div>

              {/* Font Family Selector */}
              <div className="flex items-center gap-1 px-1 border-r border-border/70">
                <select
                  value={currentFontFamily}
                  onChange={(e) => handleApplyFontFamily(e.target.value)}
                  className="h-8 px-2 text-xs font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none cursor-pointer max-w-[130px] truncate"
                  title="Font Style"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size Selector */}
              <div className="flex items-center gap-1 px-1 border-r border-border/70">
                <select
                  value={currentFontSize}
                  onChange={(e) => handleApplyFontSize(e.target.value)}
                  className="h-8 px-2 text-xs font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none cursor-pointer"
                  title="Font Size"
                >
                  {FONT_SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bold, Italic, Underline, Strike */}
              <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
                <button
                  type="button"
                  title="Bold (Ctrl+B)"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("bold");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Italic (Ctrl+I)"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("italic");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Underline (Ctrl+U)"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("underline");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Strikethrough"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("strikeThrough");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
              </div>

              {/* Text Color & Highlight Popovers */}
              <div className="flex items-center gap-1 px-1 border-r border-border/70 relative">
                {/* Text Color Button */}
                <div className="relative">
                  <button
                    type="button"
                    title="Text Colour"
                    onClick={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowHighlightPicker(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Palette className="w-4 h-4 text-purple-600" />
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-2 z-50 p-3 bg-card rounded-2xl border border-border shadow-xl w-52 space-y-2.5">
                      <div className="text-xs font-bold text-muted-foreground">Text Colour</div>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_PRESETS.map((p) => (
                          <button
                            key={p.color}
                            type="button"
                            title={p.name}
                            onClick={() => handleApplyColor(p.color)}
                            className="w-8 h-8 rounded-full border border-border/70 hover:scale-110 transition-transform shadow-2xs"
                            style={{ backgroundColor: p.color }}
                          />
                        ))}
                      </div>
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">Custom:</span>
                        <input
                          type="color"
                          onChange={(e) => handleApplyColor(e.target.value)}
                          className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent p-0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlight Color Button */}
                <div className="relative">
                  <button
                    type="button"
                    title="Highlight Background"
                    onClick={() => {
                      setShowHighlightPicker(!showHighlightPicker);
                      setShowColorPicker(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Highlighter className="w-4 h-4 text-amber-500" />
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {showHighlightPicker && (
                    <div className="absolute top-full left-0 mt-2 z-50 p-3 bg-card rounded-2xl border border-border shadow-xl w-52 space-y-2.5">
                      <div className="text-xs font-bold text-muted-foreground">Highlight Colour</div>
                      <div className="grid grid-cols-3 gap-2">
                        {HIGHLIGHT_PRESETS.map((p) => (
                          <button
                            key={p.color}
                            type="button"
                            title={p.name}
                            onClick={() => handleApplyHighlight(p.color)}
                            className="h-7 px-2 text-[11px] font-medium rounded-lg border border-border hover:scale-105 transition-transform flex items-center justify-center text-gray-800"
                            style={{ backgroundColor: p.color === "transparent" ? "#ffffff" : p.color }}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alignment: Left, Center, Right, Justify */}
              <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
                <button
                  type="button"
                  title="Align Left"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("justifyLeft");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Align Center"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("justifyCenter");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Align Right"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("justifyRight");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Justify"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("justifyFull");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              {/* Lists, Indentation, Blockquotes */}
              <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
                <button
                  type="button"
                  title="Bulleted List"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("insertUnorderedList");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Numbered List"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("insertOrderedList");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Decrease Indent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("outdent");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Outdent className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Increase Indent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("indent");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Indent className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Blockquote"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormatBlock("blockquote");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Quote className="w-4 h-4" />
                </button>
              </div>

              {/* Hyperlink, Image & Table */}
              <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
                <button
                  type="button"
                  title="Insert Hyperlink"
                  onClick={openLinkDialog}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors text-primary"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Remove Hyperlink"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleUnlink();
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Unlink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Insert Image"
                  onClick={openImageDialog}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors text-emerald-600"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Insert Table"
                  onClick={openTableDialog}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors text-blue-600"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Helper Notice & Clear Format */}
              <div className="flex items-center gap-1 pl-1">
                <button
                  type="button"
                  title="Insert Disclaimer / Notice Box"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleInsertAlert();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Notice</span>
                </button>
                <button
                  type="button"
                  title="Clear All Formatting"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec("removeFormat");
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors text-red-500"
                >
                  <RemoveFormatting className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-primary" />
                HTML Source Mode — Direct code editing for advanced tags and custom markup
              </span>
              <button
                type="button"
                onClick={() => setMode("visual")}
                className="text-xs font-bold text-primary hover:underline"
              >
                Return to Visual Mode
              </button>
            </div>
          )}
        </div>

        {/* Content Editing Canvas */}
        <div className={`relative ${isFullscreen ? "flex-1 overflow-y-auto" : ""}`}>
          {mode === "visual" ? (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorChange}
              onBlur={handleEditorChange}
              style={{ minHeight: isFullscreen ? "100%" : minHeight }}
              data-placeholder={placeholder}
              className="p-5 md:p-6 outline-none overflow-y-auto text-foreground font-sans text-sm md:text-base leading-relaxed bg-background
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:my-4 [&_h1]:text-[#4A154B]
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:my-3.5 [&_h2]:text-[#4A154B]
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:my-2.5 [&_h3]:text-[#4A154B]
                [&_h4]:text-lg [&_h4]:font-bold [&_h4]:my-2 [&_h4]:text-foreground
                [&_h5]:text-base [&_h5]:font-bold [&_h5]:my-1.5 [&_h5]:text-foreground
                [&_h6]:text-sm [&_h6]:font-bold [&_h6]:my-1 [&_h6]:text-muted-foreground
                [&_p]:my-2.5 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3 [&_ol]:space-y-1.5
                [&_li]:pl-1
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-r-xl
                [&_a]:text-primary [&_a]:underline [&_a]:font-medium [&_a]:hover:text-primary/80
                [&_hr]:my-5 [&_hr]:border-border
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm
                [&_th]:border [&_th]:border-border [&_th]:p-2.5 [&_th]:bg-muted/50 [&_th]:text-left [&_th]:font-semibold
                [&_td]:border [&_td]:border-border [&_td]:p-2.5
                empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none"
            />
          ) : (
            <textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              style={{ minHeight: isFullscreen ? "100%" : minHeight }}
              rows={16}
              className="w-full h-full p-5 font-mono text-xs md:text-sm leading-relaxed bg-muted/10 text-foreground outline-none resize-y border-0"
              placeholder="<div>Enter raw HTML or Markdown markup here...</div>"
            />
          )}
        </div>

        {/* Status / Info Footer */}
        <div className="px-4 py-2 border-t border-border/70 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Mode: <strong className="text-foreground capitalize">{mode}</strong>
            </span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
            <span>Press Ctrl+B for bold, Ctrl+I for italic</span>
          </div>
        </div>
      </div>

      {/* --- MODAL: INSERT / EDIT LINK --- */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Insert / Edit Hyperlink
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">URL (Link destination)</label>
                <input
                  type="text"
                  placeholder="https://example.com or /hipaa"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Display Text (Optional)</label>
                <input
                  type="text"
                  placeholder="Link label or leave empty to keep selection"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkOpenNewTab}
                  onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>Open link in new browser tab</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: INSERT IMAGE --- */}
      {showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Insert Image
              </h3>
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload Option */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Option 1: Upload from Computer</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors bg-muted/10">
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs font-medium text-foreground">
                    {imageUploading ? "Uploading..." : "Click or browse an image file"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">JPG, PNG, WebP, SVG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={imageUploading}
                    className="hidden"
                  />
                </label>
                {imageUploadError && (
                  <p className="text-xs text-red-500 font-medium">{imageUploadError}</p>
                )}
              </div>

              {/* Or Web URL Option */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Option 2: Image Web URL</label>
                <input
                  type="text"
                  placeholder="https://... or uploaded image path"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm"
                />
              </div>

              {/* Alt text / Caption */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Caption / Alt Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Describe image for accessibility or caption"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm"
                />
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="p-2 border border-border rounded-xl bg-muted/20 text-center">
                  <div className="text-[11px] text-muted-foreground mb-1">Image Preview:</div>
                  <img
                    src={imageUrl}
                    alt={imageAlt || "Preview"}
                    className="max-h-36 mx-auto rounded-lg object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imageUrl.trim() || imageUploading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: INSERT TABLE --- */}
      {showTableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-blue-600" />
                Insert Table
              </h3>
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={tableHasHeader}
                  onChange={(e) => setTableHasHeader(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>Include top header row</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
