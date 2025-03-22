// تعريف المتغيرات مرة واحدة فقط
let originalBodyContent = document.body.innerHTML;
let originalOpenFunction = window.open;

// وظيفة لإزالة التأثيرات عند تعطيل الميزة
function removeBlockingFeatures(blockSites, blockAds, blockPopups) {
    if (!blockSites) {
        document.body.innerHTML = originalBodyContent; // استعادة الصفحة عند تعطيل الحظر
    }

    if (!blockAds) {
        // إعادة تحميل الإعلانات
        document.querySelectorAll("iframe, .ad, .ads, [id*='ads'], [class*='ad'], [class*='ads']").forEach(el => el.remove());
    }

    if (!blockPopups) {
        window.open = originalOpenFunction; // استعادة وظيفة النوافذ المنبثقة
        document.removeEventListener("click", blockPopupLinks, true);
    }
}

// وظيفة تنفيذ الميزات
function applyBlockingFeatures(blockSites, blockAds, blockPopups, blockedSites) {
    if (blockSites) {
        const currentHost = window.location.hostname;
        if (blockedSites.some(site => currentHost.includes(site))) {
            document.body.innerHTML = "<h1>🚫 تم حظر هذا الموقع 🚫</h1>";
        }
    } else {
        document.body.innerHTML = originalBodyContent; // استعادة الصفحة عند تعطيل الحظر
    }

    if (blockAds) {
        // إزالة الإعلانات النصية والمرئية
        document.querySelectorAll("iframe, .ad, .ads, [id*='ads'], [class*='ad'], [class*='ads']").forEach(el => el.remove());
    }

    if (blockPopups) {
        window.open = function () { return null; };
        document.addEventListener("click", blockPopupLinks, true);
    } else {
        window.open = originalOpenFunction; // استعادة وظيفة النوافذ المنبثقة
        document.removeEventListener("click", blockPopupLinks, true);
    }
}

// وظيفة لمنع النوافذ المنبثقة
function blockPopupLinks(event) {
    if (event.target.tagName === "A" && event.target.target === "_blank") {
        event.preventDefault();
    }
}

// استرجاع الإعدادات عند التحميل
chrome.storage.local.get(["blockSites", "blockAds", "blockPopups", "blockedSites"], function (data) {
    applyBlockingFeatures(data.blockSites, data.blockAds, data.blockPopups, data.blockedSites || []);
});

// مراقبة التغييرات وتحديث الميزات فورًا
chrome.storage.onChanged.addListener(function (changes, namespace) {
    chrome.storage.local.get(["blockSites", "blockAds", "blockPopups", "blockedSites"], function (data) {
        removeBlockingFeatures(data.blockSites, data.blockAds, data.blockPopups);
        applyBlockingFeatures(data.blockSites, data.blockAds, data.blockPopups, data.blockedSites || []);
    });
});