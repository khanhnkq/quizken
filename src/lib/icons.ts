/**
 * Lightweight icon shim to avoid runtime forwardRef/third-party icon bundle race issues
 * Replaces heavy icon imports with a generic placeholder SVG for production/build stability.
 *
 * Rationale:
 * - Some icon libs create components using React.forwardRef and can be bundled in a way that
 *   causes `forwardRef` to be undefined at runtime in certain vendor chunk ordering.
 * - To guarantee a stable build for deploy, export lightweight placeholder icons that do not
 *   depend on external icon packages.
 *
 * Note: visually these are placeholders (simple circle). Replace individual icons with
 * proper SVG paths later if you want full fidelity.
 */

import React from "react";

export type AppIcon = (
  props: React.SVGProps<SVGSVGElement> & { size?: number }
) => JSX.Element;

const GenericIcon: AppIcon = ({ size = 24, ...props }) =>
  React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
    },
    React.createElement("circle", { cx: 12, cy: 12, r: 8 })
  );

const make = (_name: string): AppIcon => GenericIcon;

/* Export the same API surface as before but return the lightweight placeholder */
export const ArrowUp = make("ArrowUp");
export const ArrowLeft = make("ArrowLeft");
export const ArrowRight = make("ArrowRight");
export const ArrowDown = make("ArrowDown");
export const ArrowUpDown = make("ArrowUpDown");

export const Sparkles = make("Sparkles");
export const Zap = make("Zap");
export const Brain = make("Brain");

export const Loader2 = make("Loader2");
export const Shield = make("Shield");
export const LogIn = make("LogIn");
export const LogOut = make("LogOut");

export const BookOpen = make("BookOpen");
export const Book = make("Book");
export const GraduationCap = make("GraduationCap");
export const Microscope = make("Microscope");
export const FlaskConical = make("FlaskConical");
export const Film = make("Film");
export const Target = make("Target");
export const Globe = make("Globe");
export const Calculator = make("Calculator");
export const Scroll = make("Scroll");
export const MapPin = make("MapPin");
export const Laptop = make("Laptop");
export const Briefcase = make("Briefcase");
export const Heart = make("Heart");
export const Trophy = make("Trophy");
export const Award = make("Award");
export const Palette = make("Palette");
export const Music = make("Music");
export const Music4 = make("Music4");
export const Tag = make("Tag");
export const Filter = make("Filter");
export const TrendingUp = make("TrendingUp");
export const FileDown = make("FileDown");

export const CircleCheck = make("CircleCheck");
export const AlertCircle = make("AlertCircle");
export const AlertTriangle = make("AlertTriangle");

export const Menu = make("Menu");
export const User = make("User");
export const Users = make("Users");
export const Settings = make("Settings");
export const Star = make("Star");
export const MessageSquare = make("MessageSquare");
export const X = make("X");
export const XCircle = make("XCircle");
export const Download = make("Download");
export const PauseCircle = make("PauseCircle");

export const ChevronLeft = make("ChevronLeft");
export const ChevronRight = make("ChevronRight");
export const ChevronDown = make("ChevronDown");
export const ChevronUp = make("ChevronUp");

export const Check = make("Check");
export const Circle = make("Circle");
export const MoreHorizontal = make("MoreHorizontal");
export const Search = make("Search");
export const Clock = make("Clock");
export const PanelLeft = make("PanelLeft");
export const GripVertical = make("GripVertical");
export const Dot = make("Dot");
export const MousePointer = make("MousePointer");
export const ClipboardPaste = make("ClipboardPaste");

export const CheckCircle = make("CheckCircle");
export const Info = make("Info");

export const Key = make("Key");
export const Eye = make("Eye");
export const EyeOff = make("EyeOff");

export const Save = make("Save");
export const Trash2 = make("Trash2");
