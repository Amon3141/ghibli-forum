import React from 'react';

export default function GeneralButton({
  onClick: clickHandler, children, className = "", ...rest
}: {
  onClick?: () => void, children: React.ReactNode, className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`
      py-1.5 px-4 box-border rounded-md
      bg-gray-50 hover:bg-primary
      border-1 border-gray-200
      transition-all duration-200
      ${className}
    `}
      {...rest}
      onClick={clickHandler}
    >{children}</button>
  );
}