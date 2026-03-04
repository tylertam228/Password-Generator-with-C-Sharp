// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

(function () {
    var forgeBtn = document.getElementById('forgeBtn');
    var lengthSlider = document.getElementById('lengthSlider');
    var lengthValue = document.getElementById('lengthValue');
    var passwordDisplay = document.getElementById('passwordDisplay');
    var copyBtn = document.getElementById('copyBtn');
    var speechText = document.getElementById('speechText');
    var hpFill = document.getElementById('hpFill');
    var strengthValue = document.getElementById('strengthValue');
    var swordImg = document.getElementById('swordImg');
    var swordName = document.getElementById('swordName');
    var swordTierLabel = document.getElementById('swordTierLabel');
    var swordShowcase = document.getElementById('swordShowcase');
    var anvilSection = document.getElementById('anvilSection');

    if (!forgeBtn) return;

    document.querySelectorAll('.ore-bin').forEach(function (bin) {
        bin.addEventListener('click', function () {
            bin.classList.toggle('active');
            var activeCount = document.querySelectorAll('.ore-bin.active').length;
            if (activeCount === 0) {
                setSpeech("You need at least one material! I can't forge from nothing!");
            } else {
                setSpeech("Good choice! Ready when you are, adventurer.");
            }
        });
    });

    lengthSlider.addEventListener('input', function () {
        lengthValue.textContent = lengthSlider.value;
    });

    forgeBtn.addEventListener('click', forgePassword);
    copyBtn.addEventListener('click', copyPassword);

    async function forgePassword() {
        var options = {
            length: parseInt(lengthSlider.value),
            includeUppercase: document.getElementById('oreUppercase').classList.contains('active'),
            includeLowercase: document.getElementById('oreLowercase').classList.contains('active'),
            includeNumbers: document.getElementById('oreNumbers').classList.contains('active'),
            includeSymbols: document.getElementById('oreSymbols').classList.contains('active'),
            excludeCharacters: document.getElementById('excludeChars').value || null
        };

        if (!options.includeUppercase && !options.includeLowercase &&
            !options.includeNumbers && !options.includeSymbols) {
            setSpeech("You need at least one ore, adventurer! I can't forge a weapon from thin air!");
            shakeElement(document.querySelector('.materials-section'));
            return;
        }

        forgeBtn.disabled = true;
        forgeBtn.classList.add('forging');
        anvilSection.classList.add('forging');
        passwordDisplay.textContent = '\u2692 Forging... \u2692';
        passwordDisplay.classList.add('forging-text');
        setSpeech("Stand back! The forge burns hot!");

        var colors = [];
        if (options.includeUppercase) colors.push('#e74c3c');
        if (options.includeLowercase) colors.push('#4a9eff');
        if (options.includeNumbers) colors.push('#ffd700');
        if (options.includeSymbols) colors.push('#b44dff');

        createSparks(anvilSection, 15, colors);
        var sparkInterval = setInterval(function () {
            createSparks(anvilSection, 6, colors);
        }, 350);

        try {
            var response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });

            await delay(1800);
            clearInterval(sparkInterval);

            if (!response.ok) {
                var err = await response.json();
                throw new Error(err.error || 'Forge malfunction!');
            }

            var result = await response.json();

            anvilSection.classList.remove('forging');
            anvilSection.classList.add('reveal');
            passwordDisplay.classList.remove('forging-text');
            passwordDisplay.textContent = result.password;

            setTimeout(function () { anvilSection.classList.remove('reveal'); }, 800);

            updateWeaponStats(result);
            updateGoblinReaction(result.swordTier);
        } catch (error) {
            clearInterval(sparkInterval);
            anvilSection.classList.remove('forging');
            passwordDisplay.classList.remove('forging-text');
            passwordDisplay.textContent = 'Forge error!';
            setSpeech("Blast! Something went wrong: " + error.message);
        }

        forgeBtn.disabled = false;
        forgeBtn.classList.remove('forging');
    }

    function updateWeaponStats(result) {
        hpFill.style.width = result.strength + '%';
        hpFill.className = 'hp-fill';
        if (result.strength >= 80) hpFill.classList.add('legendary');
        else if (result.strength >= 50) hpFill.classList.add('high');
        else if (result.strength >= 25) hpFill.classList.add('medium');
        else hpFill.classList.add('low');

        strengthValue.textContent = result.strength + ' / 100';

        var swords = {
            'Wood':      { img: '/images/wood_sword.webp',      name: 'Wood Sword',      tier: 'Common',    cls: 'wood' },
            'Iron':      { img: '/images/iron_sword.png',       name: 'Iron Sword',      tier: 'Uncommon',  cls: 'iron' },
            'Diamond':   { img: '/images/diamond_sword.webp',   name: 'Diamond Sword',   tier: 'Rare',      cls: 'diamond' },
            'Legendary': { img: '/images/legendary_sword.png',  name: 'Legendary Sword', tier: 'Legendary', cls: 'legendary' }
        };

        var sword = swords[result.swordTier] || swords['Wood'];
        swordImg.src = sword.img;
        swordImg.alt = sword.name;
        swordName.textContent = sword.name;
        swordTierLabel.textContent = sword.tier + ' \u00B7 ' + result.strengthLabel;
        swordShowcase.className = 'sword-showcase tier-' + sword.cls;

        swordShowcase.classList.add('pop-in');
        setTimeout(function () { swordShowcase.classList.remove('pop-in'); }, 600);
    }

    function updateGoblinReaction(tier) {
        var speeches = {
            'Wood': "Hmm... a modest blade. Perhaps add more ores next time, adventurer?",
            'Iron': "Not bad! A decent weapon, but I know we can do better...",
            'Diamond': "Excellent work! That's a fine blade worthy of any warrior!",
            'Legendary': "LEGENDARY! By the forge gods, this blade will be sung about for AGES!"
        };
        setSpeech(speeches[tier] || "Interesting result...");
    }

    function setSpeech(text) {
        speechText.style.opacity = '0';
        setTimeout(function () {
            speechText.textContent = text;
            speechText.style.opacity = '1';
        }, 200);
    }

    function copyPassword() {
        var pw = passwordDisplay.textContent;
        if (!pw || pw === 'Awaiting orders, adventurer...' || pw.indexOf('Forging') !== -1 || pw === 'Forge error!') return;

        navigator.clipboard.writeText(pw).then(function () {
            copyBtn.textContent = '\u2713';
            copyBtn.classList.add('copied');
            setSpeech("Copied to your scroll! Guard it well, adventurer.");
            setTimeout(function () {
                copyBtn.textContent = '\uD83D\uDCCB';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    }

    function createSparks(container, count, colors) {
        for (var i = 0; i < count; i++) {
            var spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = (25 + Math.random() * 50) + '%';
            spark.style.top = (20 + Math.random() * 60) + '%';
            spark.style.background = colors[Math.floor(Math.random() * colors.length)];
            spark.style.setProperty('--end-x', (Math.random() * 120 - 60) + 'px');
            spark.style.setProperty('--end-y', -(15 + Math.random() * 70) + 'px');
            spark.style.animationDuration = (0.4 + Math.random() * 0.5) + 's';
            var size = (2 + Math.random() * 4) + 'px';
            spark.style.width = size;
            spark.style.height = size;
            container.appendChild(spark);
            (function (s) {
                setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1200);
            })(spark);
        }
    }

    function shakeElement(el) {
        if (!el) return;
        el.classList.add('shake');
        setTimeout(function () { el.classList.remove('shake'); }, 500);
    }

    function delay(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }
})();
