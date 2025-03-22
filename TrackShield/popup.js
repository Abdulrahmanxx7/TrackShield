document.addEventListener("DOMContentLoaded", function () {
    const toggleBlockSites = document.getElementById("toggleBlockSites");
    const toggleBlockAds = document.getElementById("toggleBlockAds");
    const toggleBlockPopups = document.getElementById("toggleBlockPopups");
  
    const blockSiteInput = document.getElementById("blockSiteInput");
    const addBlockSiteButton = document.getElementById("addBlockSite");
    const blockedSitesList = document.getElementById("blockedSitesList");
  
    // استرجاع حالة الميزات من التخزين
    chrome.storage.local.get(["blockSites", "blockAds", "blockPopups", "blockedSites"], function (data) {
        toggleBlockSites.checked = data.blockSites ?? true;
        toggleBlockAds.checked = data.blockAds ?? true;
        toggleBlockPopups.checked = data.blockPopups ?? true;
  
        if (data.blockedSites) {
            updateBlockedSitesList(data.blockedSites);
        }
    });
  
    // تحديث التخزين دون إعادة تحميل الصفحات
    function updateSetting(setting, value) {
        chrome.storage.local.set({ [setting]: value }, function () {
            console.log(`تم تحديث الإعداد: ${setting} = ${value}`);
        });
    }
  
    toggleBlockSites.addEventListener("change", () => updateSetting("blockSites", toggleBlockSites.checked));
    toggleBlockAds.addEventListener("change", () => updateSetting("blockAds", toggleBlockAds.checked));
    toggleBlockPopups.addEventListener("change", () => updateSetting("blockPopups", toggleBlockPopups.checked));
  
    // زر إضافة موقع إلى قائمة الحظر
    addBlockSiteButton.addEventListener("click", function () {
        const site = blockSiteInput.value.trim();
        if (site && isValidUrl(site)) {
            chrome.storage.local.get("blockedSites", function (data) {
                let blockedSites = data.blockedSites || [];
                if (!blockedSites.includes(site)) {
                    blockedSites.push(site);
                    chrome.storage.local.set({ blockedSites }, function () {
                        updateBlockedSitesList(blockedSites);
                        blockSiteInput.value = "";
                        updateSetting("blockedSites", blockedSites);
                        // إرسال رسالة لتحديث القواعد الديناميكية
                        chrome.runtime.sendMessage({ action: "updateRules", blockedSites: blockedSites });
                    });
                }
            });
        } else {
            alert("الرجاء إدخال عنوان URL صالح (مثال: example.com)");
        }
    });
  
    // تحديث قائمة المواقع المحجوبة
    function updateBlockedSitesList(blockedSites) {
        blockedSitesList.innerHTML = "";
        blockedSites.forEach((site, index) => {
            let li = document.createElement("li");
            li.textContent = site;
            
            let removeButton = document.createElement("button");
            removeButton.textContent = "إزالة";
            removeButton.classList.add("remove");
            removeButton.addEventListener("click", () => removeBlockedSite(index));
  
            li.appendChild(removeButton);
            blockedSitesList.appendChild(li);
        });
    }
  
    // إزالة موقع من القائمة المحظورة
    function removeBlockedSite(index) {
        chrome.storage.local.get(["blockedSites"], function (data) {
            let blockedSites = data.blockedSites || [];
            blockedSites.splice(index, 1);
            chrome.storage.local.set({ blockedSites }, function () {
                updateBlockedSitesList(blockedSites);
                updateSetting("blockedSites", blockedSites);
                // إرسال رسالة لتحديث القواعد الديناميكية
                chrome.runtime.sendMessage({ action: "updateRules", blockedSites: blockedSites });
            });
        });
    }
  
    // تحقق من صحة عنوان URL
    function isValidUrl(url) {
        try {
            new URL(`http://${url}`);
            return true;
        } catch (e) {
            return false;
        }
    }
  });