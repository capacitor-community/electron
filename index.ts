import Electron from 'electron';

export interface SplashOptions {
    imageFileName?: string;
    windowWidth?: number;
    windowHeight?: number;
    textColor?: string;
    loadingText?: string;
    textPercentageFromTop?: number;
    transparentWindow?: boolean;
    autoHideLaunchSplash?: boolean;
    customHtml?: string | null;
}

const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');
const { app, ipcMain, BrowserWindow } = require('electron');


async function encodeFromFile(filePath: string): Promise<string> {
    if (!filePath) {
        throw new Error('filePath is required.');
    }
    let mediaType = mimeTypes.lookup(filePath);
    if (!mediaType) {
        throw new Error('Media type unreconized.');
    }
    const fileData = fs.readFileSync(filePath);
    mediaType = (/\//.test(mediaType)) ? mediaType : 'image/' + mediaType;
    let dataBase64 = (Buffer.isBuffer(fileData)) ? fileData.toString('base64') : new Buffer(fileData).toString('base64');
    return 'data:' + mediaType + ';base64,' + dataBase64;
}


async function configCapacitor(mainWindow: Electron.BrowserWindow) {
    let capConfigJson = JSON.parse(fs.readFileSync(`./capacitor.config.json`, 'utf-8'));
    const appendUserAgent = capConfigJson.electron && capConfigJson.electron.appendUserAgent ? capConfigJson.electron.appendUserAgent : capConfigJson.appendUserAgent;
    if (appendUserAgent) {
        mainWindow.webContents.setUserAgent(mainWindow.webContents.getUserAgent() + " " + appendUserAgent);
    }
    const overrideUserAgent = capConfigJson.electron && capConfigJson.electron.overrideUserAgent ? capConfigJson.electron.overrideUserAgent : capConfigJson.overrideUserAgent;
    if (overrideUserAgent) {
        mainWindow.webContents.setUserAgent(overrideUserAgent);
    }
}

class CapacitorSplashScreen {

    mainWindowRef: Electron.BrowserWindow | null = null;
    splashWindow: Electron.BrowserWindow | null = null;
    splashOptions: SplashOptions = {
        imageFileName: 'splash.png',
        windowWidth: 400,
        windowHeight: 400,
        textColor: '#43A8FF',
        loadingText: 'Loading...',
        textPercentageFromTop: 75,
        transparentWindow: false,
        autoHideLaunchSplash: true,
        customHtml: null
    };

    constructor(mainWindow: Electron.BrowserWindow, splashOptions?: SplashOptions) {
    
    if (splashOptions) {
        this.splashOptions = {...splashOptions};
    }

    this.mainWindowRef = mainWindow;

    try {
        let capConfigJson = JSON.parse(fs.readFileSync(`./capacitor.config.json`, 'utf-8'));
        this.splashOptions = Object.assign(
            this.splashOptions,
            capConfigJson.plugins && capConfigJson.plugins.SplashScreen ? capConfigJson.plugins.SplashScreen : {}
        );
    } catch (e) {
        console.error(e.message);
    }

    ipcMain.on('showCapacitorSplashScreen', (event: any, options: any) => {
        this.show();
        if (options) {
        if (options.autoHide) {
            let showTime = options.showDuration || 3000;
            setTimeout(() => {
            this.hide();
            }, showTime);
        }
        }
    });

    ipcMain.on('hideCapacitorSplashScreen', (event: any, options: any) => {
        this.hide();
    });
    }

    async init() {
    let rootPath = app.getAppPath();

    this.splashWindow = new BrowserWindow({
        width: this.splashOptions.windowWidth,
        height: this.splashOptions.windowHeight,
        frame: false,
        show: false,
        transparent: this.splashOptions.transparentWindow,
        webPreferences: {
        webSecurity: true
        }
    });

    let imagePath = path.join(rootPath, 'splash_assets', this.splashOptions.imageFileName);
    let imageUrl = '';
    try {
        imageUrl = await encodeFromFile(imagePath);
    } catch (err) {
        imageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAMgCAMAAADMfUE6AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAFrUExURQAaOgEbOgIbOwUePgQePf///wIdPAEbOwIcPAIcOwQdPQMcPAkiQQojQgggQAUfPgYgPw8nRgIdPRYuSwskQg0lRBkxThMrSSE4VCA3UxQsSgYfPgskQw4nRCQ6VhIqSCM5VRszTyc9WAEaOhgwTRcvTB00UAgiQSg+WSU8Vyk/Wi1DXRAoRx82UiU7Vx41UTFGYCpAWhEqRzBFXyxBXDdLZC5EXitAWwYfPy1CXTVKYzRIYhsyTztPaDJHYTlNZkBTa0JVbTpOZz1RaT5Saik+WUlccvz9/UVYb0NXbkdacUtedFlqf1FjeU5gdrG5wxUtSwkjQZ6otbnAyVVmfNjc4amyvd7h5cvR1+3v8ZKerNDV2vj4+Wx7jfP09tXZ3niGl622wF5ug4qWpcnO1Wd2iXyKmsPK0XGAkqStuX+MnPv7/Nre473EzYOPn2Jyhujq7dLX3bW9x5eir+Ll6fHy9P7+//X29wAZOdJ5CSwAACAASURBVHja7Z3ne1Nn0ocXYWGMCxayqq1iWZJVrGJV1ItL3JGNwZRlAxhCCyVAkv3z35l5zjk6ks1euyAT8l6/O4EQG/jg2zPPzFP/8Q8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//jHv/ElAN/x+wzfbwAAMBqW5MeS/usl/dfg/4FY5pLB+Pg4/0w/lkyfB39TlFL5MT5usYhfHbFM4Kv0Nw3efsh+mUtaNMPy3y9w2dx/UGuhf0ya/63lbPTiP37kLl1a0tVaxv8HWDHG5L9BYh6/NP61IFn/8MH7RbkWQfsP/+rLYQzHP2z0jp+XmWW0tUwMYxkaiE2O0SX/mIXV2dxsEbGWibN6RTF/4gtxjK/nDzafIbnZciYr62qvXr1quTqEoflMwrZgLP5Rk/PAkKurvTqpKZ28ehZD8tnBGF/XH6frPRu6mluDySHOWD7PMYbiH2RS46zds2qv0L8G/AGLaJ40SR5SfAmGfwS/A5MaKjOb1SqhE1fOZzCaz8YxEvVfH719IUsqdicMuxNGzN64ckNxzfjpxqDl/xDH+Dr/GIOveeA1QleJvXY+/KkJw7F5OEYQ/xAMVlYTenI2MnPf7di1sTP0LUsO1x1PqlkQk2MI/kv9WvrhOxC8nIlZ7VkuD0vWE/ZVLYz1ia5+8kex9Re3vpZ+bpZw1EPXcHoeuuQxI46v9DP1YJoeh+G/sjmy9JOzHrx9uZrN64OcscyODcWTHMUD05homL53czR+nl7x20/Ml8dMbuc1rssPs+Z+th4I44E0jRgeLf/+7wX3/V6Z0HNzP3INtTfnbwqz6j/Kdd+yoXjQsAUx/JeMv6byasKcnQ27Y8otW5xlpbPEjPGTQvOsS9bjWKJYK6kHiy0Y/n7ls6UfvufoVaFLbmeW6R+Cvc4MYJgWy1ocG4pvyN9C4TwYxfjKf+8BWMvO/bH3mil4Z2cOFxwOn2NhekosLw+gi1aSdcdapr58c3n58HBmZn7sylXT7CWy9PdIz0tnRl/2K2OvlpwlNc/OTC34ci6vK7BiI8XMsvxrYtnkeF5zzH/F/Myhw7ayYnNMz1yevGqxYNryr4/fG3r0qqrq5uzMtCPnDS9Go86Id8UxPfUFtFgWyXoYz84s2Fz2MP/BhZnLV8xZGjH8neorc/xqo28/OXNNRX4D9kVP+lHVn6r3cr6F6WEONcUzy0Ygq4prdsqRoz+6/s4djQQcYthUaiGGv59f3oej0rNeW0nw3uR6atoXiGT8q4/++XNjIxi1n2dYLB9qcawc02BMI7eD/2jjV+tpyONkw5PmeS1k6YudvzonPZvDV0UvD7+ucCaefPzGar2zU/ZTKFKx1WeOGArlZS1R87dGOBXaObFaraerbqfLMTM2aZ70QJa+wPi99IXhd1AvVc8+l9MTKj0gvW+s948r8VTEZTMbNjybHEsYTy3YvE5P7Ph36+/PrNYnhWDdy1maJ6cRw9/Rr+RnmZrsp2curVjvFPkNaH5/PXgthkOpsCvncyiGJCvHakCeXljx1t3s95+P1l+Q4bK77hLD5hhGEF+w3/GJicmh9EzFEU9XUbdL8WtzhTW/u42GGE6GUk5vzuZz+Hz0Y0h0P4znHCu9enBD/FaraxzD5SBl6SkxjBD+Tv2RtvQ76FcL3+Up8ZtSfreq1WrxFzZcinucvcCKz4zJsorjBUeO/CbY7/NSMlkqimEZh+dvDCw+wMYFBrAafwfjd16FL/mddvT9bueThUq++VjFsLtuD6zYdEyStTCeo8xuX3Qrv4VQOhhPVNlwrG/4v5mWxgnTr4G+auNLRn7ux69ePet6xa8zFUqy305yI+73xyps+HOnFHMvRly5vmLdsq7YYQvYo1r8ltOpaD3qjtfI8DsxPHV9oFvCKDzyBunSUAGtxe9lLX4Nv1QEh5IvxW/InYlGPfFClgzf6ZSoIY54AyvCGccO34orEvUnOifslxorr6vnTMWbz6x/KMPUD/dnPCyosy5qhoP8WrQEPeiXp5kNv2+U38WIPeJMpQvNX9hwPhGMhnuuHGO2LI5tOW844y8bfgM2H+f6IcOX9BiG4IsagLUGyYhfKq84Py+T30Mpgt2JPOXnt8VKyFO3uwIch2T4OY3De81COuW0ewOBQC6na9Ykr+TsdU+osve79cNumae+HHP01+UopsuUpe+uUj/sG1h5QCl9MR1Sv8DS/arw5fQ87aAmNrjBfn8tJpXfXMBrd1KW5nH4w3GzEE85KfkGXAHDsjjOuai8iiXJ7z+fSvw65qa4YAuQ4do9MpwI6v0wDF/kFOVZv/Oyks/pmeLX61Tx++sW+6UBN5cLuLyRuideqT3+88/Pe7VSyLMY7nldjC55hb4LIovBWGlP6ud0JpLzLRzyzJbEcLzKhtWs5WWqpSH4ggJ4iQdgbf3InJ+18krGX3ciK35L1BRxpBIuby8cdcfy1ce/3z/Zq1bYsN1L6JJzOZeXfkciL36T8VTYZVvgaY/lmSk2nFGGuR9emLlsCmEMw6NC60w0wTz/rPpfmd7Q4nea5zfcG8pvPkH1VY/1kUOv1x6m9idffPnhw529KrmPOiM9r9eQTEmcP/9U5jdinrBrxTHHc5fLlPjJMFVaRTHsCeemb97o90oI4VEnaFMA69NXM/r4SwOwPRPKfyK/O9my38jDrLEXcVKBnC2+/Pz54U6VGmIyHOn1NMny2Q3x+4i+M2T1eEHNTnMM+wJhT6xFhh+EMj3fzJh52QFuRirYYsxwSIIeyM/TvMDgLjzm+ediKc7Fsm63Z7fbw4ueeLnZevnrr7fJ8EYw4wzTR+3kuNcL11Nkf0f8rnIBzetOc9Mqhsmwzbvor6w/tP7xOhjOTV3uT1lewozlqAN4YmAAlv5Xi9+5BfIQf/TGerK/Vq3IPIVLt2u3RyLOKBVaZPi33z7uFPMJf6oejkTkU2GeCmluUv/7iCI/QwnaJ1NbWgwvTzn4O6fWIcO/LObm5ifNyw6wM9IANirofoFl+KUWOBq/a7Xe2laCe4beCBOuR92hQrP1/t69W8fFbDntiTrD/HFnhtqj2tPP1g/vm+yX15zE8Jy+hkiCgyT4hfWP08WAEmwMw6izRuZXbcFSMxxSYEl9pfnlmeQVb9RfYsPtYol7pJ7oFbmE07mYcYeStdajFy8+HrealbgnWqcPRzPBjVKVx999mQbp8XqEzxTD0wv8nZNcu8cp2pmbvn5l4GQa/Hy7YPMagzlBy94c9ju3wPufeaW+3KVi6FajRqokBRt2iXo0FSTDjUdv39467tYKcZ6ojqb8q/niex5/axUeudVqRD+GOfXXg+XWMyqyYim7ber6lUnTgQe0SiObxNIrLG2FUDa2q/pqweGzraysBLzhTLy0zoa7HIyLnIJ1u856vb4Y9fgpWhvPb99+cky/Je5OedxpKq7FbzVJDbJMjWiGZZWYE0PdvcELw9wI5xZmxq7ImRa0SqPO0GcraK0BdthyLi+3PL1I3RPLaobLnIKdSi/LJShc3X5qh9ee37r1ar+VLYf8/pDut5in5ilsp9Y5Z4rhBR9PjsV4Wfgub8/yTc1fU4IRwiMLYJPgycnBBL0s85Muu5NyLafkcNS9mm0rwxVeK1R6RW40mslkUu44GV17/uTu0UExX0isJqnsIr8vi9lVap0iPPNhMuzwBXjxQuK3ko72bNOzfPxwsi/YgjJrtAlaBF/WKyzZREWZ2Z0Opd2ck50Zf6GpDNeSsWAqush6lVwm5QmGKs3i2vtXrx50atl8ttrl9f2XLcrpmXrYTnnAFTAM22y8wyMmG3eS8YzdNj1zfewaHz00JWlMSX+b4PEhwVqC1jpgWV/whAqPnuTLcTcF7GIqXamx4dNutRTze7iO0vWmGDfv8CiuPT06Om0Xi63G/gn7pQLLvRiOsOC+YUr9kWgwUWK/pXgqkpubmR8boxCenDTnaAgejeCBOUotgLmFcbo38o/fWJ80eH5qsR71UKXMPeuDtWp+Ne329N16hGA6kWwWu08/PdhvrLX3Tqy/v6Rop3yuZj6MGJaqLepPFKnzulsKpcKBhan5yyJ4aBSGpRFlaFOFpfmVTa6J5icr8bAtsxdR7narjSeUpdeLzUos6DbkuhXB9EYlW20db7bb289/t/6+161SNs9I0W0ynHPZ66l4gfujU15hCvimZuXw4dAojBAejeDBAOYELftzqATKkt+TW2y4Kb1timcu1ihLP2m3askNv9skVwT7QxvJbLXR7mw94vG3Uc0n/FxyU83NhlWWdnllh0dX/PK2ed/0zE2zYAzCI5zksFj6I7C+yM/7n73OoKz/nuxvK8OUailauRfauvfmz7vtbq2UiAd1sxr+dKyQrzY0v2tFzuRUjjk1w9xxuVz2yKI7VGK/t0ohj9PlW5iZuTmvGx4YhVFIf7tgI0NrAcwJWg4Ryf6Nk4O1tXU23KkmQ0EK1/hqtrX17F+/3+1QeFK7a6gV4iEehdfF7+M29cPxYCrD9bYewz1vz847AEoN9tuMeZxe28LhzMzs/PXrCOHR+7WMWwZLaBbM5xeofha/m8VqtdgQw5KT3e5QodbdeXH/w6ttCtBCKO1nuWmNUKJAvXBH+e3WCvQ9QYKji4uGYXvEyXtAlN+yu+61OQ6n+HTpYAhbUGaNKoDP9MCSn9X5o5OdZqlQKNVabHi7yjmZhtlkrbHz9vPno85aMVvYCGlu40Rog/w2NL+NWmkjzYIzHMNalo6E67wEweP4rVrZX+/xDg8+X6pC+NqZEIapUQnWV5Hk/C/5fcl+qQX2+3kpkAw/axQ5J/vTCSq0Nm+f/HpKhpvJciiuEYqVK+z3+LP1zS+SweNUhqWUYRXDYeqm/eV89wX7LaQzcj8AXwWgRmG5h0frlCB4FNPQumC53UgJnvO5Iiny+8Z6slVK+FPRqCddaHbJ8C2O2Bjl4XK+uL55685vr7fbrWapHAsxsdhGodRsrXWo/33zept/L43Qbiq0U5Kl62rZSSY0X9FfVuVzpwEbrxyy4NlZydESwuYVB1RZIwjgSS2AeQSe8/Ehbc7PL4pJ2UMXqWf85Wbr9A/rw51WrbQailOlXFzb/vTw3oOddqOaTa5uxGKxRJnq526b66v7z8VvLO6XKluCWGY2ZVWxuUbxe1qrpDNh74pPCVY5+txOCa6+ZRrLYlro50mOmWmfy+kWvyfFSogXgXglKRWnyoo+9nCnS4k3JkPt+tbRsxcPdjqNYjZZTiQS5Yru983jbZ4ISdDoHNQMZ2ReM+Pxr5Zq6+KXJzi8OZ9aGpYQvqnV0XqnpN23B1ffMsthXgi+zH4dvM9R/G7xLueIXXbGUt9aqUotvdnglaINaoZa7d1XL96ebnKwlgpl5XeH/b7ealOkl2PxOBsOaoZ5vYm66Koc7q9yA8xninXByzIIG52S6bQhcvS3DMEkeLJfYs0ekt+U5lfOL/Rka7N0NqWq9MObnHwTiUK+1u3sHr29LYab+VK+WW10lN8dapDouyAWMgx7ZEqTht98sU1+33bzMfei3bVi8+nbd5ZNIWxMVy6hEx5tDT2zkItkQoZfPmkke9t5GA7GSA4b3l3nnFyo5GuN7YOjjx9PNylL15rNoub33Q4X0JUyDcts2K8MezzuIO8A6LDfRpM3z3sDK2p3hxbCg4L1QRiXdnxLBE8MDMGz0zZv1F/R/LqddrW7vSc7Y1P+VcrKmuFmvlKgjmht6+DTrSfvqNJqFal83nnJfje5eSpRkJNgiWFVaQXTsYLmd61Z8Gf4rCmvDKsQ1nP05X4rbExXQvC3RbCxlYMDOOwuP+b5q/yGO2p3yekjERx2qmZJDG+tUwpOJks8J3nw4O7dX7baa2vt7Z2n4ndb/BZWE6I4LVnaHfTHedgWv+tUYGWcfDqRN1ny7h3J0RLC5iUlbRBGBH+V4CVjocGUoR2uxTTvbz+oJtOZiCuXE8G8gV3fGdvglYePW+1utVkq5Wut9tbug1dHj7a2t7c2n35mv1vrLbJPRZcI1rM09c6lWnf9I/ltV/XTa7kVmylHa9OVpkEYnfBXM25a6zcJ9nkzj/5pPdlv1ArBRbs6H6oFsJN7WCq0Gp2jP6wvDmjYpcIqW2utb2++Pnqwu7N58PKz9f5j8ZstVQpkeFUzLHPU5Xy1sUV+77aLfKEHn26iv1/fYqkPwsZk1hV0wt/WJF3qLzT056FJcDT70PrTaUPOL7j6ASyCM27ZGduhMfq3/W0WmW1WW2vtzsv9nd2Dl/+yvnm0Sw0SxXayYjJMIRwPJUq1xs4zq/Wo3eLLHvgEorYDT9slLdOVSnB/zRCbK79tCO7vppSVwtllR6AeLJLhd8V8jNpUV0BKLMnQdRKccqdXeQrrIxumUK02m81qsbvW2d4Uv6f7myqyBwzzVDXVV60t3j+5tVYrp1N13qHlOpOjZ4cGYRXCKKO/fhrLiGAlmLukVGz7AxluylEEOUCoMnQ9GpV9kzwNvaMM80DcbNYoiDub4ndvf4cCOMuCyXClbziUSNa4/31xsNXIbvD0p9q9Y+ToOdN89JmNOxD8tfNYeo1FGfqGMU8ZLB+IYT6hEumpAA5LAJNgt6wstQ3D3P82eQKL7D18KoJr2TwZ1mJYS9KUoavP31h/erlrCLZ7+zl6sFE6uzMLgr+2S1KbObR5yvmbM1N8jNBfYMO/NCtpvo/B3s/QLDiY3kg2G51NzbDMcNSoHz7+merjPS1FDxsOcQTzvZa/P99aa5aDvEtacnTO1CiZq6wbNwYEw9f/7Ndi3q2jC56dXZ525OzRdIUMv3ncLMSNY6AqQ7NgP0ejZvh4R+awahTCm3tk+Pb+LrXI1WY/hvUknag0i20yfHLMxxO1HG0ehNVspZaix64NCkaO/roh2FgL7u/Gmpr28cUoSTb8C59QUadWWLAEsFs62iwVWmz47cFOZ61YpVF4fWuXDX/a39zm2ks3bCTpWDlfa3TevZEWjE+XhiMqR5sFT4lgPUeb+yQI/qaZaLNgvg46kgolD06sb57LCRU+tGJkaBYcjyXZ8O4tCtljFlosFrttMnyPuiCz4aRWSXMzvCF7LV//i2KYT5d66mH7uVVWf2MWBH9TjaUmsq4OCp6d4Rux+Nb9eGn9N4phPr8gu5r7gv3U1K5WssX17c1PVuvPx5tbMhHdIMP7t1WWbkuW1kO4rI3ChVKt2/6FxuH3XTmsJJ1wYKjKGiqjcY7024roCVMEqxMr2pVJvOWuc4cMF7PluCcjezF4OVcTvFFINjkr32XDuybDP/cN5/P6KKwEhxKrbJgrraddLrRkqeqM4Jvok0Y2kTU4zyGCtTPffOgslu/cZ8PNglwrK10wZ2gWHEsU8tQsbR1QyP68J4Zb3bX2zq5RabVUDCf1MivEO/ISPBvNd8Q/bWV5NsvuHVhvMPbt8GQlBI96IouvhdYuPVvw5Xp1dyy/x4ZbXGqlMv0hWASvJvMUjjt9w10xfKAZlnGYYlgrszZkyUGmO1rrfEf80yKvVoV7A1XW1Iw5RU9C8GhS9ORVYzuHIZhv7667E002/LpVq8judWMIZsGJQjJf7XY2DcNr3a7JsKq08ipHSx3N68Lp+AandmVYrhD3Dgg2LwmbItiCTR3fJPjKmRTNlyu47NFgQTecjMn2ZrPgcqGU5XZ40HDHbLjWzPcbJVk09Me5H14jwx82eVNW3e4dTtGG4EmL7MtCBH+T4OE978vLmmAb39AeL9R0wxtp2XSjBMdYcLlSanI7zKXzPRp2O2x4nYyz4VcHvOxfzapBWM1HyxGXeIx3xtM4fGezxnuC7K7cQAQbm6PVvjusNoygyLpiStF6BDt8toCXmqWKGH7ZrZXK8aB7UDBvytIN07C701lrdBvrWgx/IsPrxVp2ULAcLy1ohndqFb46K7cykKJNbdKkaVsWnH19kaUL5oPfU3qK9tlsOb7NvVLboW7pdYN3sStBNJLqgpN5ieED7of3DjY762SYs7RSrjZbJrWpDk0w/Q1xapdaj/iOeL48S7v8bmj3+7XBuUoI/l8Z/w8RPCU3n8k97c5UPGkYrsQkyZoiOFnKSgwfHOmGVaW1u//MMFySKssQzHk+vUHt0msxXIhnItreWbUry2iTbqBNusgiiwWv5OQcfrK6eULd0hqfVIj7jQheLRfEcJX37Ozf1gyrWlrNS9+m/29UeUu8UWS5Vanm36B26bV65yEYjbhWzlTRY9cGj69A8P+62HDpPwp2KMEBb6TuDpWKT+8rw8mEnBSVKloTnG+aDdM4LP3wgOHkoGBut/yhim44EazbA7YzKfrGwHVKSNH/s+D/KoIDrl540R3LK8PU9yRXKdNymxTTBZPhIhneHTDcMAzLEYfkakLbW6kdUsqk3KFKs8X98J66JJwMD85F9yPYgir6G1P0mbnoub5gb88ZdW9kW2z49TqfLNQmHUkwDcIVEiwxvGUYbq+1Wq2+4a12q6kOsahzaNoptIybi2k2vM2bv7y58wVjDP7qKvqcuejrZwSzYbszEyw3lWE5UZYISQRzCFckhPO8ZUczvG9aeeA9Hrd4WrqZLBtFtLrPoU6G+ZQwv6i1LdewyDH/KUxVjjaCxycG1oMHBPs0wfLmQqHZfc+HyvhiHQ5HU5VFgrNkeN20WEiGi2R4kwz/8YkMU3m2GjJlaFl+jHrS5XyVDP+8XuKnWOScv/n8Gcbgb5/o6N+/YjzSsKxuAGfBKkd77eF6Kl1udp+eWP/1S7tRpYQbiskgbIRwtlkkw5v7r6zWZ7LyUCzywLx5/NZqvbu7tVbMJ2OhvmC5y8G5yFdu1agfvnNQCqUiAX5MaWDB34L14G+O4OEdHTzTcTgkuCdvbhRqfPHkm3d8brDAW3D0ENZjWGrpT2peer1VrVWLPOVBQf1xl88Pl2MDgsNhvouFnwHgeemDZJyfy5rjFH3ejo5LiOCvztHmG5TMfZIuWI4WUqEVTxbXj09kHOaT+zGjzCLBumG90pKdlbzVsrOz/xsZ5mapxBdq8W0dJJgDOKKOs2mv4h1U0vyg4fTyzMCmO2zZGdVc5bUv9EkyCNvt/LZGotnYlnGYZK2G+qOwYbjY6Gzu773lPR407MpmWhqIjzXD1EOng6YMLW+yUGpIa4YL/mhvZeHw/PV+ZOivFTx+phE2V1k24+wZhXAo3+3s8vHfx3yV0jmGay1eDX76wmr9bVc78sBb8SSGdyjuC6H0gOAeEanz26XvfiLD5WDdZZs21hpuYOP7N/Dv8+cqr+sRPDc0CPO7SKF8a3vzHW+o4nQbN5I0G+ZxWBP8/ITqqs3tNRqFBwyv8yX/6tI7laHl9mhvxJmKV8TwbsITyS3M4OjKSMtotevuSr9PYsOHeiPMggNqEM4EOUU/4qMJjVoyEY8PG5ZmeHP/Pfl9crDJi8NFOZlGI7MY5lJ6Ne5O6QGszibxRIonVCqS4YetdN3l6F8qjDZ4FDMd5jL63NloNQhzACer6+/vk991ztBpWVIyGZaDwlu7x+x3/2Bz532HuuFqMyvnh9nwg85atbTBl8TrQ7DaNCsbR2qNUzLczPR8UzdNi4UkeAmCRyL4iuk1rDM5Wo2Ute7z+9YPz9dpMI2pFQdTDJd46b+zuffC+tPd/d3NncdHjzc71Cxl1ScOnln/+LTd4KvBPXyzcDhsHC7kdzlWa402ld9HqZ6NI3hM1pKu4gD4SMpoy/AgLJ3wgGBeFSa/XOzuy8J/Wi0aqhiWKUu18L93Yv3plPLz1tajo1enfBS8li+VsjyR+ZFfxWvI5f6LRgDzC+JaBL+yWm+XM/ywznXc0XERfZJ2xP/m7Jkc7eqFo3yP4WMZf/mC6LS691sbhtX2O+6RyK+VtHba6+3tx6/uPjjgyxxKSd5fu771kAx3unIqyQhgvvq950yFStUjq/Vt1l93LczMn3OvPwL4G/oky8BzDYOdsDRK3kjUncgW2e/7Rq20qq54VyGssnSZr/Dv7OxJ/Sx74BvtnXdPnnwiw8VskrdutdZ32TA1S6v+FF9+qTK0i757uE8iv3fWYyn7yvSsMQTj9OhoB+FzOmF92w51SMpvq1ZRjzS4tQ3wbDixWpAt8Hu/yrwzb4eucTyf3vp4dLC9Vs0XCgW+Al4ZLuY3+oeDA95IOJMuZ9lve9XtDDjUEHxteKIStr5e8PjZQXhZTUfLo4UBL2/Lqiq/TdkAL1cSKsPqEEupWWxvid/NrbWW3GnII/Lp7bdHux2+0nA1wVembbLhde2FcLv0SHZ5Olzit8xP203PnHu+H2PwSAQPbp1VrXDOSyFWaHL/+14dUlIvnCnDckppVV5oOBa/fMUsX6Akp0s3T9++eLVLWTm5upEo5IsNMbxW5RtO5ejosF/b3MzAWiEu9R9ZlXVOjpYFB978TgXW/gf2m9UOoQ0YlmuF17b3ld81415hfrZh58GLZ6+22sVsJcHnv6ti+BMfDlZ3f0ScKcOvP9qzLUzNzp+ToTEEj3IQvm48Kzu34LDlqIdJ4CIpkwAAD4hJREFUZNnvU3VQWDtGqhv2x0VcZ/cF+eWz/s1KmU97b6zK00k7D+49/KQuBg+FVkvV7s5D6x+nrWaZDwfzMjP5fczjL/m1ryxMzQzfRYoiegRldP+2yjE9R2tlli9nXwyWs3zzHR8zoeJIruRXhmUc9sv1dR3Kz29O+Uwwb77SbvfndzzaW69/+/nWJpXSPPfFN5Gu3dLeH/YsLkY9Iamfb9fKwcWe+DXWgi3miwwh+Gvno89990x7eJRfluWXz/Lk9/c97bIOeTC4bzgY57tz2uz3nfS8hY2Q/j6HjM1rnXd3Tm5vyjQ0vyacL669JcO8shSUdyzZb7McjPZWHId89vuy+cJ3jMAjFTwx8LDdFB/zD7s32O+/nvKD0IvUvcptLLphT9AfqjS7bR5/X23JntqYuNXfT5KB+Ojk89udBr9VGuQzK9VtrrR47x53Vzz+qvh1TM+oq2Yv48mG0Qk2rwkbV0arMouvYgmnQqXn5Pd9tuxP1dWFWX3DfOldodlal/pqS4rlkOY2LU+gqSfutl99+PBip8EPZLnlREOHDfP9adWi9L8cv7mF6YGLSCWAl5ChRzYIW4Zfxpqa8wUimXRS95vhu0N7cqehbjjlTifyRd0vHz8MxdXjduqtO3dQXTDbeXX/9xc73Sw/RkvfE5rh9UaD55/vtCt+2asz9cWn7bDY/60p2lgUvtIXPMfXofkL4jefIL92alu1WyvZsHHx7AH73eFDZpWNuPGKofZepT+eoNK5fffPf97bKvIjpKmUO5RstmVeui1+C2nDb383FjL0qFL0l56XnRK/5QP2W0oE+S4Nl9rboRvmq6OpwNL8thtFztB+Q628pEMByzm5237yk/XeGk9SpjIZd7wghp+w304lnRG/pgc5ruFtyguYzOpPV6qXOVZ60WB59wP73XBH+SaNXMAwTOPwoux47XbucX7ebq8ftKpZPntokuvpP/nOb7U8aVSTMlHiSZfFMPtNxjPhnGNO+R14rgE7okcSwuc+8X59ZtrWo/h9/8H6ea/A92i4cisrfcN8NWmUA7G1e8/65kGnvdb+5dNel88e8iUAHl2uzGp6gnEaiNc+/WF92+HV4Gg9mgkm8nKzP8dvJEB+za+eXcMT7xdQR/fPKNEoPHvo4/jl8XenrN2xoHbvBLRxWI46ZFu7d6j/XW+0iu3To6OnPAyrq1p0uepyLRmru6dW6z0yzN0W79As5J/cbib80UjAp/nlBI0Avrg6uh/CNAC76sFV9vuUymd1w4LJsGzB869mi5t3rNYHcptwtf3g1av3azJ/4dHtst7FRXmskNI0v116r803GHKJlgrGeeZz0S7nVZYH3g4eCmDU0KMrpCWE56ccAac78Z79FvjZBr5Aw2E2bOcDpXnx+0rev6J2d/Po7pPnPCXJ+yZV6JJdeW60zuN1Rd4uJcNlfq0hHOaraxfD2suy5gpraKEQgkdUSOshfO0yv5zk2Xj/J8dvmlIon713OIwY5j0Yi55Qqar5LW3E46HVfHH/1a1bz9eK3O2mdLsydS0Pynri5Wb3CRlez27wa3ncUdu9Af3I6GCLZBJsgd/RFdJy7+zYzekVeyqk/PIUhG9hbs5s2OWVLZbVHfbbrfIOAH6QsNk9vvvx4/NGUd8Zq9kNh+WyaTmhIll6vRRK8YtnfNO7b8Hk13SegfxOIIBHxbj5dY7JMXkZ64D8vi9Q/Mq5+2mzYZcs0jfFL19xyI2P9Lbd41tv3z5qyAXTUT125UV3edSd72Pit0vvNcpyYwNfnCQ3RE+Z/A6PwJewEjzqXnhsyhbxbH/m+atYilqYaVn7NwyvBHphXiHukt8jqprjHl5iqsshwdbxxxcvHnVl24f2mLvIpb6KEnKdzy9wP3wrH4/y2Ktd8c4vu2sVtGkZCSPwRU1njR2uOHc+W+8/r5bSi14btTADhldckUXqYju3rW+O5CJpWWKitpi3RpLhZ/eetsRw3WSXzyD1ItR41RrbNA7fLWUk84tfdTFWP0EPbHfHNPRoWyU2fJkEP/7D+nC7mkzXXb7p5eVlbf+ObLIMRBbdifz2HbkKPhHMOGWJSRpjfyJf3Ln18LeXraba+yznQ5Ve3n61yII7r6zWj6uZ3opDi1+9wNKmOIZaYPTAoxyFJUlzina/JsPrpbjskuKlYS2GfTZ1iTT5tf5SK8nj73wEVM1tZYIb+erO7Tt3XhabZX6OJ2LYdXHpnUlXqrx+9Dabrnttfb/6ItINvYKenMA60sWMwpykb8w6vNEQTzt1E26niy9V0AzLDcNhddG/9aiZDLlla6S8jMYz1OqF8J2HJycvqVni9UW7odfVi/B3RlHWjxKesHZnkuZ3fmAANu2lRACPOEmPT0zcuD69EvYk7pLhIvUzvBCgxfCcw+YKZ0JJ8cuvpizK4+/8PLhI1gzv/fzhw8tiXt3Xr+zK/udUKCn7NzoFvwpgc/wOrBLqHRIqrIuYsZy8NrvgcrrLbLgaV0sBfIf04TQ/thP1F9oSv4V0ii96lqkt3THfxxCqVPdO7t9/XM3H+L5+Ph8aUKfXtPMpHXUXx9z0sub3pmkAtlzFCHzhSXryMnXCzuCqMqwW41nwAq8QB8viN1tIZ8Je9iuKlWSXtxemXqhS2/v855+Pq8kQhbicD9VbZ9mfI359c0b8an4lfocmoeF3lK1Sv86avD7Diw2Spat+nuugcXhq2rHSow82xK8sQQRWqC3mVURNMkcq38dQaB5/+OnNYy6l63ZeR3b1yG9CnT+iyI+Y/Wr5+Zq+D2sSk9AXHsITVyiGvXWVpWW20jF3OK220Db5lHY+IS9H2xS645yei+PqnYdHzUI8Je8Pe8MZfX87Rb5MjpniV5vBGl5EwjLhBcbwVZ6vdLpj7/6wPmvyJYM2B7+yE0x0H1rfPKbcq6YafTJ5qRzrlrkdCmqNcrMQooG6x+NvOftJ7W9XKV/T24/fs34Rvxcwn2XRpju0cVgZrkkcuuyLmt9KiK+GtTkcPLOlK9YtywXTUXciz2+mqbdL69Fhv4cyfaWFr4y/xr2UEPx9JrQmruqGrWyYN2FkxK/1U4V6J+8KP0THU1vi2GSZJ6tdkUVqlzon6u3SoDsYKrDfO81EcLGXk/05/fgd08Zfjl+L2S8S9MVOWV7RDD9hwxvpoD9eZr9HBZWxeQVRU6w5NoWyi58BKB3f5xguFcqFUpP9rieCdT6/oGafZwfjV/LzVfj9foXWVS1Ll9lwMVmolBrst8IvaNgc09Nqdlp3rEtWplcCPacnLoZ/KdZqteondX7B7PfmzesqfseM8de0xAC/FyT4bAwHxXCjVmtr8cub5NQSokxPmyRrnnnNKefliSsx3Gg09PPdyq9kZw7fwfyM+P2eISwxfOX6jI/6YTHc3hK/0uTICqIybHJs0kyicy5+UutY7ojX/PJNo9NTml5Jz/oKv/KLAP6ec9Ka4Snuhwtk+MUL8luWWY9pciTrD4Zjs2RNtc/mimTSBTZ8S+VnPv97aA5fY/gdjl/4vXDDS/1x2MfjMI2h1jfvEuqQ9iyfD+cT4szhtMGgZ4eNJ67LB3foj75dT7jrXr4puF9caXq1BUIWPA6/3z1LT9yQcdgTOrW+eRnyqEtS5m/eFMMqivuBPATfDhANJtZ+tt7Oc+fMK8v97KyNvoZfU/xiBut7ZmmZlw5ngqevgxlqj6a5d52fv6lF8fJ/krzgyPXqHn/xVdmfcnp9c1MDg68Wvvr8lTk/Y4bjO3XDfGpY5qVzvXC9Hu7lHId8C91lUaw7ntEV6xzqP/H6sTdSz6QydTtV3tIaqcHX5FcLX8TvX5SleYfH5Zlp30ousEIxOM99KxsmxRLGuuTlYc0qrBdsOVfP3gvw9Qyz8/NGbWXonbwqWyj7mygxQ/l9szTv4bkydnOGUvDhzCyfDBPDmuOb/TjWPZvg4J7m6y59C5ye2a4RvYZfNfwiP39nxs0D8dWrV65dvjx/naecblwTxWNKscSxKZANpuTnWfkVb3yWaWfNrj63QXrPlFfIz39JDKtTaZNcEV0xFJscz89qlmdnNNP8C535m/NDdrXi+ezwC7/fjyVVZpnOtFyVs4dmxXqu1kOZLN9k1ypzU0WlRl2Rq+waydlofk3pGX4vnH+bDV8ajOK+4SuSqfuKdckqmg20j6nfcdmwa7RGKnpN1TPmN753LW023Fc8aWTqAcmXrxuedbPX+27P0TuUnXHM7PtnaVOl1Q/i/mh87Vpfsm55kDGT3H5uNsLXiF8LjjD85YophlW1JYav9gsuQ/GYWbX5A5rdAb1SO5vjF35/jDStR/FVvaa+cWMwksfOqDXkDkWvOTtj+L34ouq/MKwrFk16plaWr+mMaT+pj9xgucru5LnJGbNXf32WHlJsCuPJvmQVyzd0sSpsjchlt1pqNus1HgZG/P7FedocbeZMrQWyYXkAs1zdrvS9A8GL9PxDGF46q3hiYtIkWQ/mSTF6pZ+Ujd901XJObsbc8w8CNanDYSySrw4wOcDg59SsxpBejL4/bp6mxuZcyWbfJrdDZTO25vx4xdZAUzyUrL/k2fgkZ+Yzgi/9A+H7wxbUlv6uD5GsxTL9mJCfzJxNzEjOP6jhpUvnRLEMyBaLKZj7Yi2Wc+3SiL4Evz/kFAgrPivZMiD6i16Nvgi1849dbpHjS1+w90WtJrkorX78cksY/x+Rbwzo/TuVXOelazNLRlRfwpTV3y+QtZUILZaXvhy34xK6KKv+jo6Xlvp7ey59adiF2b9/uuZ/tBJqXK/COCeT3KV/4wv0/6RL5j556R8sm3+xNJST4RkAAAAA4EugUgIAAAAwDgMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+NP4PHK0dz0+mYLoAAAAASUVORK5CYII=`;
    }

    let splashHtml = this.splashOptions.customHtml || `
        <html style="width: 100%; height: 100%; margin: 0; overflow: hidden;">
        <body style="background-image: url('${imageUrl}'); background-position: center center; background-repeat: no-repeat; width: 100%; height: 100%; margin: 0; overflow: hidden;">
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${this.splashOptions.textColor}; position: absolute; top: ${this.splashOptions.textPercentageFromTop}%; text-align: center; font-size: 10vw; width: 100vw;">
            ${this.splashOptions.loadingText}
            </div>
        </body>
        </html>
    `;

    this.mainWindowRef.on('closed', () => {
        if (this.splashWindow && !this.splashWindow.isDestroyed()) {
        this.splashWindow.close();
        }
    });
    
    this.splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`);

    this.splashWindow.webContents.on('dom-ready', async () => {
        this.splashWindow.show();
        setTimeout(async () => {
        this.mainWindowRef.loadURL(`file://${rootPath}/app/index.html`);
        }, 4500);
    });

    if (this.splashOptions.autoHideLaunchSplash) {
        this.mainWindowRef.webContents.on('dom-ready', () => {
        this.mainWindowRef.show();
        this.splashWindow.hide();
        });
    }
    }

    show() {
    this.splashWindow.show();
    this.mainWindowRef.hide();
    }

    hide() {
    this.mainWindowRef.show();
    this.splashWindow.hide();
    }

}

module.exports = {
    CapacitorSplashScreen,
    configCapacitor
}