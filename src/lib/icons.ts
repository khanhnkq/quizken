/**
 * Icon bridge — import trực tiếp các icon từ lucide-react
 * và re-export với tên mà project đã sử dụng.
 *
 * Đã thay thế Radix Icons bằng Lucide Icons để đồng nhất hệ thống icon.
 */
import React from "react";
import * as L from "lucide-react";
import type { LucideIcon as LRIcon } from "lucide-react";

export type AppIcon = LRIcon;
export type LucideIcon = AppIcon;

/**
 * Re-exports: map tên dùng trong project -> Lucide icon component
 * Những tên không tồn tại 1:1 được ánh xạ sang icon gần nhất.
 */

export const X = L.X;
export const XCircle = L.XCircle;

export const Check = L.Check;
export const CheckCircle = L.CheckCircle;
export const CircleCheck = L.CheckCircle;
export const Circle = L.Circle;

export const Search = L.Search;

export const ChevronLeft = L.ChevronLeft;
export const ChevronRight = L.ChevronRight;
export const ChevronDown = L.ChevronDown;
export const ChevronUp = L.ChevronUp;

export const ArrowLeft = L.ArrowLeft;
export const ArrowRight = L.ArrowRight;
export const ArrowUp = L.ArrowUp;
export const ArrowDown = L.ArrowDown;
export const ArrowUpDown = L.ArrowUpDown;

export const Home = L.Home;
export const Menu = L.Menu;
export const LogOut = L.LogOut;
export const User = L.User;
export const Settings = L.Settings;
export const LayoutDashboard = L.LayoutDashboard;
export const Loader2 = L.Loader2;
export const Shield = L.Shield;
export const LogIn = L.LogIn;
export const Sparkles = L.Sparkles;
export const Brain = L.Brain;
export const Zap = L.Zap;
export const Download = L.Download;
export const FileDown = L.FileDown;
export const Trash2 = L.Trash2;
export const ClipboardPaste = L.ClipboardPaste;
export const PauseCircle = L.PauseCircle;
export const Star = L.Star;
export const Dot = L.Dot;
export const MoreHorizontal = L.MoreHorizontal;
export const Clock = L.Clock;
export const Info = L.Info;
export const AlertTriangle = L.AlertTriangle;
export const Key = L.Key;
export const Eye = L.Eye;
export const EyeOff = L.EyeOff;
export const Save = L.Save;
export const MessageSquare = L.MessageSquare;
export const CircleHelp = L.CircleHelp;

export const Book = L.Book;
export const BookOpen = L.BookOpen;
export const GraduationCap = L.GraduationCap;
export const Microscope = L.Microscope;
export const Film = L.Film;
export const Target = L.Target;
export const Calculator = L.Calculator;
export const Scroll = L.Scroll;
export const MapPin = L.MapPin;
export const Laptop = L.Laptop;
export const Briefcase = L.Briefcase;
export const Trophy = L.Trophy;
export const Award = L.Award;
export const FlaskConical = L.FlaskConical;
export const Globe = L.Globe;
export const Heart = L.Heart;
export const Tag = L.Tag;
export const AlertCircle = L.AlertCircle;
export const Palette = L.Palette;
export const Music = L.Music;
export const Music4 = L.Music;
export const FileDownAlt = L.FileDown;
export const RefreshCw = L.RefreshCw;
export const Store = L.Store;
export const Package = L.Package;
export const Headphones = L.Headphones;

export const TrendingUp = L.TrendingUp;

export const Users = L.Users;
export const Filter = L.Filter;
export const PanelLeft = L.PanelLeft;
export const MousePointer = L.MousePointer;
export const GripVertical = L.GripVertical;
export const Share = L.Share;
export const Share2 = L.Share2; // Deprecated, use Share
export const Facebook = L.Facebook || L.Link;
export const Github = L.Github || L.Link;
export const Mail = L.Mail || L.Link;

// Removed failing icons


/**
 * Generic maker to get an icon by name if needed.
 * Returns a React component (may be undefined if Lucide has no matching export).
 */
export const make = (name: string): AppIcon | undefined => {
  const map: Record<string, AppIcon> = {
    X,
    XCircle,
    Check,
    CheckCircle,
    CircleCheck,
    Circle,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Home,
    Menu,
    LogOut,
    User,
    Settings,
    LayoutDashboard,
    Loader2,
    Shield,
    LogIn,
    Sparkles,
    Brain,
    Zap,
    Download,
    FileDown,
    Trash2,
    ClipboardPaste,
    PauseCircle,
    Star,
    Dot,
    MoreHorizontal,
    Clock,
    Info,
    AlertTriangle,
    Key,
    Eye,
    EyeOff,
    Save,
    MessageSquare,
    Book,
    BookOpen,
    GraduationCap,
    Microscope,
    Film,
    Target,
    Calculator,
    Scroll,
    MapPin,
    Laptop,
    Briefcase,
    Trophy,
    Award,
    FlaskConical,
    Globe,
    Heart,
    Tag,
    AlertCircle,
    Palette,
    Music,
    Music4,
    FileDownAlt,
    RefreshCw,
    TrendingUp,
    Users,
    Filter,
    PanelLeft,
    MousePointer,
    GripVertical,
  };
  return map[name];
};
