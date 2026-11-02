"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon, RotateCwIcon } from "@/components/icons";

interface ImageEditorModalProps {
  open: boolean;
  imageSrc: string;
  type: "logo" | "banner";
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export function ImageEditorModal({
  open,
  imageSrc,
  type,
  onClose,
  onSave,
}: ImageEditorModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset adjustments whenever a new image or modal opens
  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [open, imageSrc]);

  const isLogo = type === "logo";
  const frameWidth = isLogo ? 220 : 320;
  const frameHeight = isLogo ? 220 : 160;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleApply = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const exportWidth = isLogo ? 400 : 800;
    const exportHeight = isLogo ? 400 : 400;
    canvas.width = exportWidth;
    canvas.height = exportHeight;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      ctx.clearRect(0, 0, exportWidth, exportHeight);

      // Save context
      ctx.save();

      // Translate to center of canvas
      ctx.translate(exportWidth / 2, exportHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Position offset scale factor
      const scaleFactor = exportWidth / frameWidth;
      const drawX = position.x * scaleFactor;
      const drawY = position.y * scaleFactor;

      // Draw centered image
      const aspect = img.width / img.height;
      let targetW = exportWidth;
      let targetH = exportWidth / aspect;
      if (targetH < exportHeight) {
        targetH = exportHeight;
        targetW = exportHeight * aspect;
      }

      ctx.drawImage(img, drawX - targetW / 2, drawY - targetH / 2, targetW, targetH);
      ctx.restore();

      onSave(canvas.toDataURL("image/jpeg", 0.9));
      onClose();
    };
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title={`Adjust Playlist ${isLogo ? "Logo" : "Banner"}`}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Save & Apply
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "center" }}>
        {/* Crop / Preview Frame */}
        <div
          style={{
            position: "relative",
            width: frameWidth,
            height: frameHeight,
            borderRadius: isLogo ? "50%" : "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 0 2px var(--brand)",
            cursor: isDragging ? "grabbing" : "grab",
            background: "#000",
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
        >
          <img
            src={imageSrc}
            alt="Adjust preview"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
          />
        </div>

        <p className="text-muted text-small" style={{ margin: 0 }}>
          Drag image to re-center
        </p>

        {/* Controls Toolbar */}
        <div style={{ width: "100%", display: "grid", gap: "var(--space-3)" }}>
          {/* Zoom Slider */}
          <div style={{ display: "grid", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-xs)" }}>
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="range"
            />
          </div>

          {/* Quick Buttons: Rotate & Reset */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRotation((r) => (r - 90) % 360)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <RotateCcwIcon width={14} height={14} /> Rotate -90°
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <RotateCwIcon width={14} height={14} /> Rotate +90°
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
              }}
            >
              Reset
            </Button>
          </div>

        </div>
      </div>
    </Modal>
  );
}
