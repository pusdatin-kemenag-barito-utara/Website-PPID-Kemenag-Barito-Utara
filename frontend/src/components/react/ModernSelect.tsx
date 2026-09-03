import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ModernSelectOption {
	label: string;
	value: string;
	description?: string;
	icon?: React.ElementType;
}

interface ModernSelectProps {
	value: string;
	onChange: (value: string) => void;
	options: (ModernSelectOption | string)[];
	placeholder?: string;
	icon?: React.ElementType;
	error?: boolean;
	className?: string;
	id?: string;
}

export default function ModernSelect({
	value,
	onChange,
	options,
	placeholder = 'Pilih opsi...',
	icon: LeadingIcon,
	error = false,
	className = '',
	id,
}: ModernSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Normalize options
	const normalizedOptions: ModernSelectOption[] = options.map((opt) =>
		typeof opt === 'string' ? { label: opt, value: opt } : opt,
	);

	const selectedOption = normalizedOptions.find((opt) => opt.value === value);

	// Click outside listener
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Escape key listener
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	return (
		<div ref={containerRef} className={`relative w-full ${className}`} id={id}>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				className={`w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-medium flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left ${
					isOpen
						? 'border-[#007144] ring-2 ring-[#007144]/20 shadow-xs'
						: error
							? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
							: 'border-input hover:border-input/80 focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20'
				}`}
			>
				<div className="flex items-center gap-2 truncate flex-1">
					{LeadingIcon && (
						<LeadingIcon className="w-4 h-4 text-muted-foreground shrink-0" />
					)}
					{selectedOption?.icon && (
						<selectedOption.icon className="w-4 h-4 text-[#007144] shrink-0" />
					)}
					<span
						className={`truncate ${
							selectedOption ? 'text-foreground' : 'text-muted-foreground/70 font-normal'
						}`}
					>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
				</div>

				<ChevronDown
					className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
						isOpen ? 'rotate-180 text-[#007144]' : 'text-muted-foreground'
					}`}
				/>
			</button>

			{/* Dropdown Menu Popover */}
			{isOpen && (
				<div className="absolute left-0 right-0 top-full mt-1.5 z-[100] bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
					<div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
						{normalizedOptions.map((opt) => {
							const isSelected = opt.value === value;
							const ItemIcon = opt.icon;
							return (
								<button
									key={opt.value}
									type="button"
									role="option"
									aria-selected={isSelected}
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2 transition-all cursor-pointer ${
										isSelected
											? 'bg-[#007144]/15 text-[#007144] font-bold'
											: 'text-foreground/90 hover:bg-accent hover:text-foreground'
									}`}
								>
									<div className="flex items-center gap-2 truncate flex-1">
										{ItemIcon && (
											<ItemIcon
												className={`w-4 h-4 shrink-0 ${
													isSelected ? 'text-[#007144]' : 'text-muted-foreground'
												}`}
											/>
										)}
										<div className="truncate">
											<span className="block truncate">{opt.label}</span>
											{opt.description && (
												<span className="block text-[11px] text-muted-foreground font-normal truncate">
													{opt.description}
												</span>
											)}
										</div>
									</div>

									{isSelected && (
										<Check className="w-4 h-4 text-[#007144] shrink-0" />
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
