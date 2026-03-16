import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick = null,
  animate = true,
}) => {
  const Component = animate ? motion.div : 'div';

  const animationProps = animate ? {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    whileHover: hover ? { y: -4 } : {},
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`card ${hover ? 'card-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
};

export default Card;
