import * as React from "react";
import * as RadixIcons from "@radix-ui/react-icons";

export type AppIcon = React.FC<
  React.SVGProps<SVGSVGElement> & { size?: number }
>;
export type LucideIcon = AppIcon;

type RadixIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type RadixIconMap = Record<string, RadixIconComponent>;

// Cast module exports to a string-indexed map of icon components
const ICONS = RadixIcons as unknown as RadixIconMap;

const FALLBACK_ICON = "QuestionMarkCircledIcon";

function pick(name: string, alt?: string): AppIcon {
  const Comp: RadixIconComponent =
    ICONS[name] ?? (alt ? ICONS[alt] : undefined) ?? ICONS[FALLBACK_ICON];

  const Wrapped: AppIcon = ({ size, ...rest }) => {
    const props: React.SVGProps<SVGSVGElement> = { ...rest };
    if (size != null) {
      props.width = size;
      props.height = size;
    }
    return React.createElement(Comp, props);
  };
  return Wrapped;
}

// Common icons mapping (Radix Icons), with graceful fallbacks
export const ArrowUp = pick("ArrowUpIcon");
export const ArrowLeft = pick("ArrowLeftIcon");
export const ArrowRight = pick("ArrowRightIcon");
export const ArrowDown = pick("ArrowDownIcon");
export const ArrowUpDown = pick("SwitchVerticalIcon", "UpdateIcon");

export const Sparkles = pick("MagicWandIcon", "StarIcon");
export const Zap = pick("LightningBoltIcon");
export const Brain = pick("RocketIcon");

export const Loader2 = pick("ReloadIcon", "UpdateIcon");
export const Shield = pick("ShieldIcon", "LockClosedIcon");
export const LogIn = pick("EnterIcon", "ArrowRightIcon");
export const LogOut = pick("ExitIcon", "ArrowLeftIcon");

export const BookOpen = pick("ReaderIcon");
export const Book = pick("ReaderIcon");
export const GraduationCap = pick("BackpackIcon", "BookmarkIcon");
export const Microscope = pick("ActivityLogIcon", "RocketIcon");
export const FlaskConical = pick("MixerVerticalIcon", "BeakerIcon");
export const Film = pick("VideoIcon", "PlayIcon");
export const Target = pick("TargetIcon", "Crosshair1Icon");
export const Globe = pick("GlobeIcon");
export const Calculator = pick("PlusCircledIcon", "UpdateIcon");
export const Scroll = pick("ReaderIcon");
export const MapPin = pick("PinBottomIcon", "PinRightIcon");
export const Laptop = pick("DesktopIcon", "LaptopIcon");
export const Briefcase = pick("ArchiveIcon", "BackpackIcon");
export const Heart = pick("HeartIcon");
export const Trophy = pick("StarIcon", "RocketIcon");
export const Award = pick("StarIcon", "RocketIcon");
export const Palette = pick("MixerHorizontalIcon", "Pencil2Icon");
export const Music = pick("SpeakerLoudIcon", "SpeakerModerateIcon");
export const Music4 = pick("SpeakerLoudIcon", "SpeakerModerateIcon");
export const Tag = pick("TagIcon", "BookmarkIcon");
export const Filter = pick("MixerHorizontalIcon", "MixerVerticalIcon");
export const TrendingUp = pick("TriangleUpIcon", "ArrowUpIcon");
export const FileDown = pick("FileIcon", "DownloadIcon");

export const CircleCheck = pick("CheckCircledIcon", "CheckIcon");
export const AlertCircle = pick("InfoCircledIcon", "ExclamationTriangleIcon");
export const AlertTriangle = pick("ExclamationTriangleIcon");

export const Menu = pick("HamburgerMenuIcon");
export const User = pick("PersonIcon");
export const Users = pick("PersonIcon");
export const Settings = pick("GearIcon");
export const Star = pick("StarIcon");
export const MessageSquare = pick("ChatBubbleIcon");
export const X = pick("Cross2Icon", "Cross1Icon");
export const XCircle = pick("CrossCircledIcon");
export const Download = pick("DownloadIcon");
export const PauseCircle = pick("PauseIcon");

export const ChevronLeft = pick("ChevronLeftIcon");
export const ChevronRight = pick("ChevronRightIcon");
export const ChevronDown = pick("ChevronDownIcon");
export const ChevronUp = pick("ChevronUpIcon");

export const Check = pick("CheckIcon");
export const Circle = pick("CircleIcon");
export const MoreHorizontal = pick("DotsHorizontalIcon");
export const Search = pick("MagnifyingGlassIcon");
export const Clock = pick("ClockIcon");
export const PanelLeft = pick("PanelLeftIcon", "LayoutIcon");
export const GripVertical = pick("DragHandleDots2Icon");
export const Dot = pick("DotFilledIcon");
export const MousePointer = pick("CursorArrowIcon");
export const ClipboardPaste = pick("ClipboardCopyIcon", "ClipboardIcon");

export const CheckCircle = pick("CheckCircledIcon", "CheckIcon");
export const Info = pick("InfoCircledIcon", "InfoIcon");

export const Key = pick("KeyIcon", "LockClosedIcon");
export const Eye = pick("EyeOpenIcon", "EyeClosedIcon");
export const EyeOff = pick("EyeClosedIcon", "EyeOpenIcon");

export const Save = pick("DownloadIcon", "CheckIcon");
export const Trash2 = pick("TrashIcon", "ArchiveIcon");
