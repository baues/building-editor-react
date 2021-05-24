import React, { useState, CSSProperties } from 'react';
import { color } from '../Color';

const baseStyle: CSSProperties = {
  fontSize: 16,
  width: 130,
  height: 40,
  border: 'none',
  borderTop: color['contextMenu/border'] ? `solid 1px ${color['contextMenu/border']}` : undefined,
  // whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  backgroundColor: color['contextMenu/background'],
};

const styles: { [index: string]: CSSProperties } = {
  menuItem: {
    ...baseStyle,
  },
  hover: {
    ...baseStyle,
    backgroundColor: color['contextMenu/background/hover'] || undefined,
  },
};

export default function ContextMenuItem(props: React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  const [hover, setHover] = useState(false);

  function handleEnter(): void {
    setHover(true);
  }

  function handleLeave(): void {
    setHover(false);
  }

  return (
    <button {...props} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={hover ? styles.hover : styles.menuItem}>
      {props.children}
    </button>
  );
}
