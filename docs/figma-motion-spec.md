# LiftTrack Motion Specification

This motion system is designed for an iPhone Home Screen web app and a Figma Starter-plan prototype. It uses Smart Animate between named layers and component states; it does not depend on paid Figma Motion timelines, variables, or advanced conditional prototyping.

## Principles

- Motion explains a state change; it does not decorate an idle screen.
- Glass surfaces settle quickly and move only a few pixels.
- Primary actions feel responsive without bounce-heavy motion.
- Persistent navigation and workout controls remain spatially stable.
- Every transition has a reduced-motion equivalent.

## Timing and easing

| Token | Duration | Figma easing | Code equivalent | Use |
| --- | ---: | --- | --- | --- |
| Quick | 180 ms | Quick / Ease out | `cubic-bezier(.2,.8,.2,1)` | Press feedback, selected navigation |
| Standard | 280 ms | Ease out | `cubic-bezier(.2,.8,.2,1)` | Day selection, details, small state changes |
| Emphasis | 420 ms | Gentle | `cubic-bezier(.16,1,.3,1)` | Screen sections, exercise changes, action dock |

## Prototype states

Keep matching layer names and nesting identical between paired frames so Smart Animate can interpolate them.

### Dashboard day selection

- Frames: `Dashboard / Recovery` and `Dashboard / Training`.
- Trigger: tap a day cell.
- Transition: Smart Animate, 280 ms, Ease out.
- Animate: selected-day glass fill, day title, mission content, and workout groups.
- Keep fixed: week picker and bottom navigation.

### Start workout

- Frames: `Dashboard / Training` to `Workout / Cardio`.
- Trigger: tap `Start workout`.
- Transition: Smart Animate, 420 ms, Gentle.
- Match the mission title/image group to the exercise title/image group when practical.
- The workout action dock enters from 18 px below while fading in.

### Next exercise

- Frames: `Workout / Cardio` and `Workout / Strength`.
- Trigger: tap `Next`.
- Transition: Smart Animate, 420 ms, Gentle.
- Exercise image, title, target chips, and logging panel move 12 px from the trailing edge and fade in.
- Progress bar width animates in place; the toolbar and bottom dock do not move.

### Complete a set

- Component variants: `Set / Pending` and `Set / Completed`.
- Trigger: tap the completion control.
- Transition: Smart Animate, 280 ms, Gentle.
- Row scale settles from 100% to 98.5% and back; the completion control settles from 78% through 108% to 100%.
- The green surface change should remain subtle enough to preserve text contrast.

### Exercise details

- Component variants: `Exercise Row / Collapsed` and `Exercise Row / Expanded`.
- Trigger: tap `Details`.
- Transition: Smart Animate, 280 ms, Ease out.
- Reveal copy from 4 px above with opacity; surrounding rows reflow naturally.

### Bottom navigation

- Component variants: `Tab Bar / Today`, `Tab Bar / History`, and `Tab Bar / Settings`.
- Trigger: tap a destination.
- Transition: Smart Animate, 180 ms, Quick.
- Only the selected tint, glow, and 2 px vertical lift change.

## Reduced motion

Create a reduced-motion prototype branch with Dissolve at 100 ms or Instant transitions. Remove translation, scaling, glow animation, and stagger. State color changes and progress values can remain.

## Code mapping

- Motion tokens and keyframes: `src/index.css` under `Unified liquid-glass system`.
- Day and mission remount keys: `src/pages/Dashboard.tsx`.
- Exercise transition keys: `src/pages/ActiveWorkout.tsx`.
- Reduced-motion handling: the existing `prefers-reduced-motion` rule plus the day-rail scroll behavior in `Dashboard.tsx`.
