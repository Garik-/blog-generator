
; (function () {
    function isObject(value) {
        var type = typeof value;
        return value != null && (type == 'object' || type == 'function');
    }

    function debounce(func, wait, options) {
        var lastArgs,
            lastThis,
            maxWait,
            result,
            timerId,
            lastCallTime,
            lastInvokeTime = 0,
            leading = false,
            maxing = false,
            trailing = true;

        if (typeof func != 'function') {
            throw new TypeError('Expected a function');
        }
        wait = wait || 0;
        if (isObject(options)) {
            leading = !!options.leading;
            maxing = 'maxWait' in options;
            maxWait = maxing ? Math.max(options.maxWait || 0, wait) : maxWait;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
            var args = lastArgs,
                thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            // Reset any `maxWait` timer.
            lastInvokeTime = time;
            // Start the timer for the trailing edge.
            timerId = setTimeout(timerExpired, wait);
            // Invoke the leading edge.
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime,
                timeWaiting = wait - timeSinceLastCall;

            return maxing
                ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
                : timeWaiting;
        }

        function shouldInvoke(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime;

            // Either this is the first call, activity has stopped and we're at the
            // trailing edge, the system time has gone backwards and we're treating
            // it as the trailing edge, or we've hit the `maxWait` limit.
            return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
                (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            var time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            // Restart the timer.
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            // Only invoke if we have `lastArgs` which means `func` has been
            // debounced at least once.
            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined) {
                clearTimeout(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(Date.now());
        }

        function debounced() {
            var time = Date.now(),
                isInvoking = shouldInvoke(time);

            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (maxing) {
                    // Handle invocations in a tight loop.
                    clearTimeout(timerId);
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined) {
                timerId = setTimeout(timerExpired, wait);
            }
            return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    }


    function topicsScroll() {
        const container = document.getElementsByClassName('topics-carousel-container')[0];
        if (!container) return;

        const arrowPrev = document.getElementsByClassName('topics-carousel-left')[0];
        const arronNext = document.getElementsByClassName('topics-carousel-right')[0];
        const scrollPixels = 100;

        container.removeChild(arronNext);
        container.removeChild(arrowPrev);

        let showNextArrow = false;
        const setShowNextArrow = (state) => {
            if (state === showNextArrow) return;
            showNextArrow = state;
            if (showNextArrow) {
                container.appendChild(arronNext);
            } else {
                container.removeChild(arronNext);
            }
        }

        let showPrevArrow = false;
        const setShowPrevArrow = (state) => {
            if (state === showPrevArrow) return;
            showPrevArrow = state;
            if (showPrevArrow) {
                container.appendChild(arrowPrev);
            } else {
                container.removeChild(arrowPrev);
            }
        }

        // Scroll logic
        const scrollBy = (pixels) => {
            container.scrollBy({ left: pixels, behavior: 'smooth' });
        };

        const scrollNext = () => scrollBy(scrollPixels);
        const scrollPrev = () => scrollBy(-scrollPixels);

        // Update arrow visibility
        const updateArrowVisibility = () => {
            const scrollableWidth = container.scrollWidth - container.clientWidth;
            const isScrollable = Math.floor(scrollableWidth - container.scrollLeft) > 0;
            const firstItemLeft = container.firstChild.offsetLeft || 0;

            setShowNextArrow(isScrollable);
            setShowPrevArrow(container.scrollLeft > firstItemLeft);
        }


        // Sync selected item into view
        const selectedItem = document.querySelector('.topics-carousel-item-text[data-selected]');
        if (container && selectedItem) {
            const { offsetLeft: itemLeft, clientWidth: itemWidth } = selectedItem;
            const containerLeft = container.scrollLeft;
            const containerRight = containerLeft + container.clientWidth;

            if (itemLeft < containerLeft + 72) {
                container.scrollTo({ left: itemLeft - 72, behavior: 'smooth' });
            } else if (itemLeft + itemWidth > containerRight - 72) {
                container.scrollTo({ left: itemLeft + itemWidth - container.clientWidth + 72, behavior: 'smooth' });
            }
        }

        const handleResize = debounce(updateArrowVisibility, 100);
        window.addEventListener('resize', handleResize);
        container.addEventListener('scroll', updateArrowVisibility);

        arronNext.addEventListener('click', scrollNext);
        arrowPrev.addEventListener('click', scrollPrev);


        let childrenWidth = 0;
        for (let i = 0; i < container.children.length; i++) {
            childrenWidth += parseInt(container.children[i].offsetWidth, 10);
        }
        setShowNextArrow(childrenWidth > container.clientWidth);
    }

    document.addEventListener('DOMContentLoaded', () => {
        topicsScroll()
    });
})();