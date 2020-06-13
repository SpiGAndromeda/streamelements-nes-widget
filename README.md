# The NerdOverNews StreamElements (SE) widget of the Never Ending Challenge
This widget has to be included via the SE overlay editor.

## Concept
The widget catches and saves several events to the SE object store.
It attaches an event listener to the window. The events are then injected by SE.

The donation sum and the resulting streaming hours are then calculated and displayed.

## Events
* Donations
* Cheers
* Twitch Subscriptions

## Commands
```
!nes-podcast {amount} - Adds the amount of money as a podcast subscription. Floating point values are allowed. 
!nes-steady {amount} - Alias for !nes-podcast.
!nes-patreon {amount} - Alias for !nes-podcast.

!nes-set-offset {amount} - Sets the money offset to the given value. Floating point values are allowed.

!nes-remove-last-donation - Removes the last donation in case something went wrong.

!nes-reset-donations - Resets the donations to an empty array.
!nes-reset-cheers - Resets the cheers to an empty array.
!nes-reset-twitch-subscriptions - Resets the twitch subscriptions to an empty array.
!nes-reset-podcast-subscriptions - Resets the podcast subscriptions to an empty array.
!nes-reset-all - Resets donations, cheers and subscriptions to empty arrays and the offset to 0.
```