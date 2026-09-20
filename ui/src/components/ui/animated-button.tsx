import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type AnimatedButtonProps = HTMLMotionProps<'button'> & {
  children?: React.ReactNode
}

/**
 * Primary execution control. Adapted from VengeanceUI animated-button.
 * Theme tokens keep the shine effect industrial rather than decorative.
 */
export default function AnimatedButton({
  children = 'Browse Components',
  className = '',
  disabled,
  ...rest
}: AnimatedButtonProps) {
  return (
    <motion.button
      {...rest}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-md border border-border bg-background px-6 py-2',
        'font-medium text-foreground transition-colors duration-[var(--vng-transition-speed,150ms)]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        '[--shine:rgba(255,255,255,.55)]',
        className,
      )}
    >
      <span className="relative z-10 flex h-full w-full items-center justify-center tracking-wide">
        {children}
      </span>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block rounded-md p-px"
        style={{
          background:
            'linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
        initial={{ backgroundPosition: '100% 0', opacity: 0 }}
        animate={{ backgroundPosition: ['100% 0', '0% 0'], opacity: [0, 1, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
    </motion.button>
  )
}
