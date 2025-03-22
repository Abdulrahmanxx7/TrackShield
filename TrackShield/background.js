// دالة لتحديث القواعد الديناميكية بناءً على قائمة المواقع المحظورة
function updateDynamicRules(blockedSites) {
    const dynamicRules = blockedSites.map((site, index) => {
        return {
            id: 100 + index,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: site,
                resourceTypes: ["main_frame", "sub_frame", "script", "image"]
            }
        };
    });

    // نحذف أي قواعد ديناميكية سابقة ذات IDs تبدأ من 100
    const removeRuleIds = [];
    for (let i = 100; i < 100 + blockedSites.length + 100; i++) {
        removeRuleIds.push(i);
    }

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: removeRuleIds,
        addRules: dynamicRules
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error updating dynamic rules:", chrome.runtime.lastError);
        } else {
            console.log("Dynamic rules updated successfully!");
        }
    });
}

// عند بدء تشغيل الإضافة، نقرأ قائمة المواقع المحظورة ونحدث القواعد
chrome.storage.local.get(["blockedSites"], function (data) {
    const blockedSites = data.blockedSites || [];
    updateDynamicRules(blockedSites);
});

// نستمع للتغييرات في التخزين لتحديث القواعد تلقائيًا عند تعديل القائمة
chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && changes.blockedSites) {
        updateDynamicRules(changes.blockedSites.newValue);
    }
});

// استمع لرسائل التحديث من popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "updateRules") {
        updateDynamicRules(message.blockedSites);
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        blockSites: false,
        blockAds: false,
        blockPopups: false,
        blockedSites: []
    });
});

console.log("Background script is running and dynamic rules are set up.");