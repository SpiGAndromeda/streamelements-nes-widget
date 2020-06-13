const allowedEvents = ['tip-latest', 'cheer-latest', 'subscriber-latest', 'message'];

const REGEX_PODCAST = /!(nes-steady|nes-patreon|nes-podcast) ([+-]?([0-9]*[.])?[0-9]+)/i;
const REGEX_OFFSET = /!nes-set-offset ([+-]?([0-9]*[.])?[0-9]+)/i;
const REGEX_COMMAND = /!(nes-reset-donations|nes-reset-cheers|nes-reset-twitch-subscriptions|nes-reset-podcast-subscriptions|nes-reset-all)/i;

const nesDataDefault = {
    offset: 0,
    donations: [],
    cheers: [],
    twitchSubscriptions: [],
    podcastSubscriptions: [],
};

/**
 *
 * @param message
 * @param regex
 * @returns {boolean}
 */
function checkMessage(message, regex) {
    if (parseInt(message.tags.mod) === 1) {
        return false;
    }

    return null !== message.text.match(regex);
}

/**
 *
 * @param eventData
 * @param nesData
 */
function addDonation(eventData, nesData) {
    const {name, amount, message} = eventData;
    const donation = {
        received: Date.now(),
        user: name,
        amount: amount,
        message: message
    };

    console.log(donation);
    nesData.donations.push(donation);
}

/**
 *
 * @param nesData
 */
function resetDonations(nesData) {
    nesData.donations = [];
}

/**
 *
 * @param eventData
 * @param nesData
 */
function addCheer(eventData, nesData) {
    console.log(eventData);
    const {name, amount, message} = eventData;
    const cheer = {
        received: Date.now(),
        user: name,
        amount: amount,
        message: message
    };

    nesData.cheers.push(cheer);
}

/**
 *
 * @param nesData
 */
function resetCheers(nesData) {
    nesData.cheers = [];
}

/**
 *
 * @param eventData
 * @param nesData
 */
function addTwitchSubscription(eventData, nesData) {
    const {name, tier, message} = eventData;
    const twitchSubscription = {
        received: Date.now(),
        subscriber: name,
        tier: ('prime' === tier) ? 1 : tier / 1000,
        message: message
    };

    nesData.twitchSubscriptions.push(twitchSubscription);
}

/**
 *
 * @param nesData
 */
function resetTwitchSubscriptions(nesData) {
    nesData.twitchSubscriptions = [];
}

/**
 *
 * @param eventData
 * @param nesData
 */
function addPodcastSubscriber(eventData, nesData) {
    const {text} = eventData;
    const amount = text.match(REGEX_PODCAST)[2];
    const podcastSubscription = {
        received: Date.now(),
        amount: parseFloat(amount)
    }

    nesData.podcastSubscriptions.push(podcastSubscription);
}

/**
 *
 * @param nesData
 */
function resetPodcastSubscriptions(nesData) {
    nesData.podcastSubscriptions = [];
}

/**
 *
 * @param eventData
 * @param nesData
 */
function setOffset(eventData, nesData) {
    const {text} = eventData;
    const amount = text.match(REGEX_OFFSET)[2];

    nesData.offset = parseFloat(amount);
}

/**
 *
 * @param nesData
 */
function resetAll(nesData) {
    nesData.offset = 0;
    nesData.donations = [];
    nesData.cheers = [];
    nesData.twitchSubscriptions = [];
    nesData.podcastSubscriptions = [];
}

/**
 *
 * @param nesData
 * @returns {{hours: number, twitchSubscriptions: number, donations: number, podcastSubscriptionSum: number, sum: number}}
 */
function calculateNesScreen(nesData) {
    let donationSum = 0;
    nesData.donations.forEach((donation) => {
        donationSum += donation.amount;
    });

    let cheerSum = 0;
    nesData.cheers.forEach((cheer) => {
       cheerSum += cheer.amount / 100;
    });

    let twitchSubscriptionSum = 0;
    nesData.twitchSubscriptions.forEach((twitchSubscription) => {
        switch (twitchSubscription.tier) {
            case 1:
                twitchSubscriptionSum += 3;
                break;
            case 2:
                twitchSubscriptionSum += 6;
                break;
            case 3:
                twitchSubscriptionSum += 15;
                break;
            default:
        }
    });

    let podcastSubscriptionSum = 0;
    nesData.podcastSubscriptions.forEach((podcastSubscription) => {
        podcastSubscriptionSum += podcastSubscription.amount;
    });

    const sum = donationSum + cheerSum + twitchSubscriptionSum + podcastSubscriptionSum + nesData.offset;
    const hours = Math.floor((sum) / 100);

    return {
        donations: donationSum,
        twitchSubscriptions: twitchSubscriptionSum,
        podcastSubscriptionSum: podcastSubscriptionSum,
        sum: sum,
        hours: hours
    }
}

function displayNesData(nesData) {
    const container = $('.nes-widget-container');
    const sumLine = $('<h1></h1>').text('Gesamtsumme : ' + nesData.sum + '€');
    const hoursLine = $('<h1></h1>').text('Gespendete Stunden: ' + nesData.hours);

    const beginTime = new Date('13.06.2020 14:00:00');
    const endTime = new Date(beginTime.getTime() + (nesData.hours * 3600 * 1000));
    //const endLine = $('<h1></h1>').text('Ende: ' + endTime)

    container.empty();
    container.append(sumLine);
    container.append(hoursLine);
}

window.addEventListener('onWidgetLoad', () => {
    // Initiate the nesData Object if not already persisted.
    SE_API.store.get('nes-data').then(nesData => {
        if (null === nesData || undefined === nesData) {
            SE_API.store.set('nes-data', nesDataDefault);
        }

        if (undefined === nesData.offset) {
            nesData.offset = 0;
        }
        if (undefined === nesData.donations) {
            nesData.donations = [];
        }
        if (undefined === nesData.cheers) {
            nesData.cheers = [];
        }
        if (undefined === nesData.twitchSubscriptions) {
            nesData.twitchSubscriptions = [];
        }
        if (undefined === nesData.podcastSubscriptions) {
            nesData.podcastSubscriptions = [];
        }
        SE_API.store.set('nes-data', nesData);

        const nesScreen = calculateNesScreen(nesData);
        displayNesData(nesScreen);
    });
});

window.addEventListener('onEventReceived', function (obj) {
    const listener = obj.detail.listener;
    const data = obj.detail.event;

    if (!allowedEvents.includes(listener)) {
        return;
    }

    SE_API.store.get('nes-data').then(nesData => {
        switch (listener) {
            case 'tip-latest':
                addDonation(data, nesData);
                break;
            case 'cheer-latest':
                addCheer(data, nesData);
                break;
            case 'subscriber-latest':
                addTwitchSubscription(data, nesData);
                break;
            case 'message':
                if (checkMessage(data.data, REGEX_PODCAST)) {
                    addPodcastSubscriber(data.data, nesData);
                } else if (checkMessage(data.data, REGEX_OFFSET)) {
                    setOffset(data.data, nesData);
                } else if (checkMessage(data.data, REGEX_COMMAND)) {
                    switch (data.data.text) {
                        case '!nes-reset-donations':
                            resetDonations(nesData);
                            break;
                        case '!nes-reset-cheers':
                            resetCheers(nesData);
                            break;
                        case '!nes-reset-twitch-subscriptions':
                            resetTwitchSubscriptions(nesData);
                            break;
                        case '!nes-reset-podcast-subscriptions':
                            resetPodcastSubscriptions(nesData);
                            break;
                        case '!nes-reset-all':
                            resetAll(nesData);
                            break;
                        default:
                    }
                }
                break;
            default:
        }

        SE_API.store.set('nes-data', nesData);

        const nesScreen = calculateNesScreen(nesData);
        displayNesData(nesScreen);
    });
});