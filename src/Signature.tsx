import React, { useState, useRef, useEffect } from "react";
import "./Signature.css";
const SignatureCapture: React.FC = () => {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signature, setSignature] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("#000000"); // Initial color is black
  const [penSize, setPenSize] = useState<number>(2); // Initial pen size
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const disableScroll = (event: TouchEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener("touchstart", disableScroll, { passive: false });
    canvas.addEventListener("touchmove", disableScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", disableScroll);
      canvas.removeEventListener("touchmove", disableScroll);
    };
  }, []);

  useEffect(() => {
    if (!signature || !signatureRef.current) return;

    const ctx = signatureRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(
        0,
        0,
        signatureRef.current.width,
        signatureRef.current.height
      );
      const img = new Image();
      img.src = signature;
      img.onload = () => {
        ctx.drawImage(
          img,
          0,
          0,
          signatureRef.current !== null ? signatureRef.current.width : 0,
          signatureRef.current !== null ? signatureRef.current.height : 0
        );
      };
    }
  }, [signature]);

  const getPosition = (
    event:
      | React.TouchEvent<HTMLCanvasElement>
      | React.MouseEvent<HTMLCanvasElement>
  ) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    if ("touches" in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  };

  const handleStartDrawing = (
    event:
      | React.TouchEvent<HTMLCanvasElement>
      | React.MouseEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const { x, y } = getPosition(event);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = selectedColor; // Set the stroke color
      ctx.lineWidth = penSize; // Set the pen size
    }
  };

  const handleDrawing = (
    event:
      | React.TouchEvent<HTMLCanvasElement>
      | React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !canvasRef.current) return;

    const { x, y } = getPosition(event);
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleEndDrawing = () => {
    setIsDrawing(false);
    if (!canvasRef.current) return;

    const signatureData = canvasRef.current.toDataURL();
    setSignature(signatureData);
  };

  const handleClearSignature = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignature("");
    }
  };

  const handleDownloadSignature = () => {
    if (!signatureRef.current) {
      console.error("Signature canvas reference is null");
      return;
    }

    const image = signatureRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "signature.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handlePenSizeChange = (size: number) => {
    setPenSize(size);
  };

  return (
    <div
    // style={{ display: "flex", flexDirection: "column" }}
    >
      <h1>Signature Capture</h1>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{ border: "1px solid black" }}
        onTouchStart={handleStartDrawing}
        onTouchMove={handleDrawing}
        onTouchEnd={handleEndDrawing}
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={handleEndDrawing}
      />
      <br />
      <div
        style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}
      >
        <ColorButton color='#000000' onClick={handleColorChange} />
        <ColorButton color='#FF0000' onClick={handleColorChange} />
        <ColorButton color='#00FF00' onClick={handleColorChange} />
        <ColorButton color='#0000FF' onClick={handleColorChange} />
        <ColorButton color='#FFFF00' onClick={handleColorChange} />
        <ColorButton color='#FF00FF' onClick={handleColorChange} />
        <ColorButton color='#00FFFF' onClick={handleColorChange} />
        {/* <ColorButton color='#FFFFFF' onClick={handleColorChange} /> */}
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <PenSizeButton size={2} onClick={handlePenSizeChange} />
        <PenSizeButton size={4} onClick={handlePenSizeChange} />
        <PenSizeButton size={6} onClick={handlePenSizeChange} />
        <PenSizeButton size={8} onClick={handlePenSizeChange} />
      </div>
      <br />
      <button className='button' onClick={handleClearSignature}>
        Clear Signature
      </button>
      <button className='button' onClick={handleDownloadSignature}>
        Download Signature
      </button>
      {signature && (
        <div>
          <h2>Signature Preview:</h2>
          <canvas
            ref={signatureRef}
            width={400}
            height={200}
            style={{ border: "1px solid black" }}
          />
        </div>
      )}
    </div>
  );
};

interface ColorButtonProps {
  color: string;
  onClick: (color: string) => void;
}

const ColorButton: React.FC<ColorButtonProps> = ({ color, onClick }) => {
  return (
    <button
      style={{
        backgroundColor: color,
        width: "30px",
        height: "30px",
        margin: "5px",
        border: "none",
      }}
      onClick={() => onClick(color)}
    />
  );
};

interface PenSizeButtonProps {
  size: number;
  onClick: (size: number) => void;
}

const PenSizeButton: React.FC<PenSizeButtonProps> = ({ size, onClick }) => {
  return (
    <button
      style={{ width: "40px", height: "40px", margin: "5px", border: "none" }}
      onClick={() => onClick(size)}
      className='color-button'
    >
      {size}
    </button>
  );
};

export default SignatureCapture;
