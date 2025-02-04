import React from 'react';
import { HTMLAttributes, ReactNode } from "react";
import styles from './styles.module.css'

type ButtonGroupType = "default" | "borderless";

export interface ButtonGroupElementProps
extends Omit<HTMLAttributes<HTMLButtonElement>, "children"> {
    value: string;
    label?: ReactNode;
}

export interface ButtonGroupProps
extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
    options: Array<ButtonGroupElementProps>;
    selected?: string;
    onClick?: (value: string) => void;
    fillWidth?: boolean;
    type?: ButtonGroupType;
}

export const ButtonGroup = ({
  options,
  selected,
  fillWidth,
  onClick,
  type,
  ...props
}: ButtonGroupProps) => {
  const lastIndex = options.length - 1;
  const btns = options.map(({ value, label, ...rest }, index) => {
    const position: ButtonPosition =
      index === 0 ? "left" : index === lastIndex ? "right" : "center";
    const isActive = value === selected;

    return (
      <button
        key={value}
        className={`${styles.button} ${isActive ? styles.active : ""} ${
          styles[position]
        } ${fillWidth ? styles.fillWidth : ""} ${
          type === "borderless" ? styles.borderless : ""
        }`}
        onClick={() => onClick?.(value)}
        role="button"
        aria-pressed={isActive}
        {...rest}
      >
        {label}
      </button>
    );
  });
  return (
    <div
      className={`${styles.buttonGroupWrapper} ${
        fillWidth ? styles.fillWidth : ""
      } ${type === "borderless" ? styles.borderless : ""}`}
      {...props}
    >
      {btns}
    </div>
  );
};

type ButtonPosition = "left" | "center" | "right";

export default ButtonGroup;

