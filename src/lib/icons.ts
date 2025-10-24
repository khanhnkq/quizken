/**
 * Icon bridge — import trực tiếp các icon từ @radix-ui/react-icons
 * và re-export với tên mà project đã sử dụng.
 *
 * Nếu Radix không có icon chính xác, dùng icon tương đương gần nhất.
 */
import React from "react";
import {
  Cross1Icon,
  CrossCircledIcon,
  CheckIcon,
  CheckCircledIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HamburgerMenuIcon,
  PersonIcon,
  LockClosedIcon,
  LoopIcon,
  MagicWandIcon,
  LightningBoltIcon,
  DownloadIcon,
  TrashIcon,
  ClipboardCopyIcon,
  PauseIcon,
  StarIcon,
  DotIcon,
  DotsHorizontalIcon,
  ClockIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  ReaderIcon,
  EnterIcon,
  ChatBubbleIcon,
  ExitIcon,
  GearIcon,
  GroupIcon,
  AlignLeftIcon,
  CursorArrowIcon,
  DragHandleVerticalIcon,
  DoubleArrowUpIcon,
  FileTextIcon,
  VideoIcon,
  SpeakerLoudIcon,
  ColorWheelIcon,
  BackpackIcon,
  PieChartIcon,
  TextIcon,
  PinTopIcon,
  BadgeIcon,
  TrackNextIcon,
  LaptopIcon,
  MixerHorizontalIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  CircleIcon,
} from "@radix-ui/react-icons";

export type AppIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number }
>;
export type LucideIcon = AppIcon;

/**
 * Re-exports: map tên dùng trong project -> Radix icon component
 * Những tên không tồn tại 1:1 được ánh xạ sang icon gần nhất.
 */

export const X = Cross1Icon;
export const XCircle = CrossCircledIcon;

export const Check = CheckIcon;
export const CheckCircle = CheckCircledIcon;
export const CircleCheck = CheckCircledIcon;
export const Circle = CircleIcon;

export const Search = MagnifyingGlassIcon;

export const ChevronLeft = ChevronLeftIcon;
export const ChevronRight = ChevronRightIcon;
export const ChevronDown = ChevronDownIcon;
export const ChevronUp = ChevronUpIcon;

export const ArrowLeft = ArrowLeftIcon;
export const ArrowRight = ArrowRightIcon;
export const ArrowUp = ArrowUpIcon;
export const ArrowDown = ArrowDownIcon;
export const ArrowUpDown = DoubleArrowUpIcon;

export const Menu = HamburgerMenuIcon;
export const LogOut = ExitIcon;
export const User = PersonIcon;
export const Settings = GearIcon;
export const Loader2 = LoopIcon;
export const Shield = LockClosedIcon;
export const LogIn = EnterIcon;
export const Sparkles = MagicWandIcon;
export const Brain = MagicWandIcon;
export const Zap = LightningBoltIcon;
export const Download = DownloadIcon;
export const FileDown = FileTextIcon;
export const Trash2 = TrashIcon;
export const ClipboardPaste = ClipboardCopyIcon;
export const PauseCircle = PauseIcon;
export const Star = StarIcon;
export const Dot = DotIcon;
export const MoreHorizontal = DotsHorizontalIcon;
export const Clock = ClockIcon;
export const Info = InfoCircledIcon;
export const AlertTriangle = ExclamationTriangleIcon;
export const Key = LockClosedIcon;
export const Eye = EyeOpenIcon;
export const EyeOff = EyeClosedIcon;
export const Save = DownloadIcon;
export const MessageSquare = ChatBubbleIcon;

export const Book = ReaderIcon;
export const BookOpen = ReaderIcon;
export const GraduationCap = ReaderIcon;
export const Microscope = MagnifyingGlassIcon;
export const Film = VideoIcon;
export const Target = PinTopIcon;
export const Calculator = PieChartIcon;
export const Scroll = TextIcon;
export const MapPin = PinTopIcon;
export const Laptop = LaptopIcon;
export const Briefcase = BackpackIcon;
export const Trophy = BadgeIcon;
export const Award = BadgeIcon;
export const FlaskConical = PieChartIcon;
export const Globe = PinTopIcon;
export const Heart = StarIcon;
export const Tag = BadgeIcon;
export const AlertCircle = InfoCircledIcon;
export const Palette = ColorWheelIcon;
export const Music = SpeakerLoudIcon;
export const Music4 = SpeakerLoudIcon;
export const FileDownAlt = FileTextIcon;

export const TrendingUp = ArrowUpIcon;

export const Users = GroupIcon;
export const Filter = MixerHorizontalIcon;
export const PanelLeft = AlignLeftIcon;
export const MousePointer = CursorArrowIcon;
export const GripVertical = DragHandleVerticalIcon;

/**
 * Generic maker to get an icon by name if needed.
 * Returns a React component (may be undefined if Radix has no matching export).
 */
export const make = (name: string): AppIcon | undefined => {
  const map: Record<string, AppIcon> = {
    X: Cross1Icon,
    XCircle: CrossCircledIcon,
    Check: CheckIcon,
    CheckCircle: CheckCircledIcon,
    Search: MagnifyingGlassIcon,
    ChevronLeft: ChevronLeftIcon,
    ChevronRight: ChevronRightIcon,
    ChevronDown: ChevronDownIcon,
    ChevronUp: ChevronUpIcon,
    ArrowLeft: ArrowLeftIcon,
    ArrowRight: ArrowRightIcon,
    ArrowUp: ArrowUpIcon,
    ArrowDown: ArrowDownIcon,
    ArrowUpDown: DoubleArrowUpIcon,
    Menu: HamburgerMenuIcon,
    LogOut: ExitIcon,
    User: PersonIcon,
    Settings: GearIcon,
    Loader2: LoopIcon,
    Shield: LockClosedIcon,
    LogIn: EnterIcon,
    Sparkles: MagicWandIcon,
    Zap: LightningBoltIcon,
    Download: DownloadIcon,
    Trash2: TrashIcon,
    ClipboardPaste: ClipboardCopyIcon,
    PauseCircle: PauseIcon,
    Star: StarIcon,
    Dot: DotIcon,
    MoreHorizontal: DotsHorizontalIcon,
    Clock: ClockIcon,
    Info: InfoCircledIcon,
    AlertTriangle: ExclamationTriangleIcon,
    Key: LockClosedIcon,
    Eye: EyeOpenIcon,
    EyeOff: EyeClosedIcon,
    Save: DownloadIcon,
    MessageSquare: ChatBubbleIcon,
    Book: ReaderIcon,
    GraduationCap: ReaderIcon,
    Microscope: MagnifyingGlassIcon,
    Film: VideoIcon,
    Target: PinTopIcon,
    Calculator: PieChartIcon,
    Scroll: TextIcon,
    MapPin: PinTopIcon,
    Laptop: LaptopIcon,
    Briefcase: BackpackIcon,
    Trophy: BadgeIcon,
    Award: BadgeIcon,
    FlaskConical: PieChartIcon,
    Globe: PinTopIcon,
    Heart: StarIcon,
    Tag: BadgeIcon,
    AlertCircle: InfoCircledIcon,
    Palette: ColorWheelIcon,
    Music: SpeakerLoudIcon,
    FileDown: FileTextIcon as unknown as AppIcon,
    TrendingUp: ArrowUpIcon as unknown as AppIcon,
    Users: GroupIcon,
    Filter: MixerHorizontalIcon as unknown as AppIcon,
    PanelLeft: AlignLeftIcon as unknown as AppIcon,
    MousePointer: CursorArrowIcon as unknown as AppIcon,
    GripVertical: DragHandleVerticalIcon as unknown as AppIcon,
  };
  return map[name];
};
