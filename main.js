document.addEventListener("DOMContentLoaded", () => {
    // Matter.js Physics Animation for Hero
    initMatterPhysics();
    // Contact Section Bouncing Ball
    initContactPhysics();

    // Scroll Fade-in Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Accordion Toggle Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const hoverScrambleChars = '!<>-_\\/[]{}—=+*^?#';

    accordionHeaders.forEach(header => {
        const h3 = header.querySelector('h3');
        const originalName = h3.textContent;

        // 호버 시 스크램블 효과
        header.addEventListener('mouseenter', () => {
            applyHoverScramble(h3);
        });

        // 클릭 이벤트
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const isActive = currentItem.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-icon').textContent = '↓';
            });

            // If the clicked item was not active, open it
            if (!isActive) {
                currentItem.classList.add('active');
                header.querySelector('.accordion-icon').textContent = '↑';
            }
        });
    });

    // Generic Title Scramble Reveal Animation
    function initTitleScramble(selector) {
        const elements = document.querySelectorAll(selector);
        const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';

        elements.forEach(el => {
            const originalText = el.dataset.text || el.textContent;
            if (!el.dataset.text) el.dataset.text = originalText;

            let hasPlayed = false;

            // 초기 상태: 랜덤 문자로 채우기
            let initialScrambled = '';
            for (let i = 0; i < originalText.length; i++) {
                if (originalText[i] === ' ') initialScrambled += ' ';
                else initialScrambled += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
            el.textContent = initialScrambled;

            const titleObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasPlayed) {
                        hasPlayed = true;
                        titleObserver.unobserve(entry.target);

                        let iteration = 0;
                        const totalIterations = originalText.length * 2;

                        const interval = setInterval(() => {
                            el.textContent = originalText
                                .split('')
                                .map((char, index) => {
                                    if (index < Math.floor(iteration / 2)) return char;
                                    if (char === ' ') return ' ';
                                    return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                                })
                                .join('');

                            iteration++;
                            if (iteration > totalIterations) {
                                clearInterval(interval);
                                el.textContent = originalText;
                            }
                        }, 30);
                    }
                });
            }, { threshold: 0.1 });

            titleObserver.observe(el);
        });
    }

    // Initialize existing features
    initTitleScramble('#experience-title');
    initTitleScramble('#contact-title');
    initTitleScramble('.work-title-ko');
    initTitleScramble('.work-title-en');

    // Slider Logic
    function initSlider(id) {
        const slider = document.getElementById(id);
        if (!slider) return;

        const track = slider.querySelector('.slider-track');
        const dots = slider.querySelectorAll('.dot');
        let images = Array.from(track.children);
        const originalCount = images.length;
        if (originalCount <= 1) return;

        // 클론 생성 (무한 루프용)
        const firstClone = images[0].cloneNode(true);
        const lastClone = images[originalCount - 1].cloneNode(true);

        track.appendChild(firstClone);
        track.insertBefore(lastClone, images[0]);

        let currentIdx = 1; // 클론 때문에 1번부터 시작
        let isTransitioning = false;

        function updateSlider(animate = true) {
            if (!animate) {
                track.style.transition = 'none';
            } else {
                track.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
            }
            track.style.transform = `translateX(-${currentIdx * 100}%)`;

            // 도트 업데이트 (인덱스 보정)
            let dotIdx = currentIdx - 1;
            if (currentIdx === 0) dotIdx = originalCount - 1;
            if (currentIdx === originalCount + 1) dotIdx = 0;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === dotIdx);
            });
        }

        // 초기 위치 설정
        updateSlider(false);

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIdx === 0) {
                currentIdx = originalCount;
                updateSlider(false);
            }
            if (currentIdx === originalCount + 1) {
                currentIdx = 1;
                updateSlider(false);
            }
        });

        // Auto slide with variable duration
        let slideTimer;
        function startTimer() {
            clearTimeout(slideTimer);
            
            // 현재 슬라이드 타입 확인 (1-based currentIdx를 0-based images 인덱스로 변환)
            let checkIdx = currentIdx - 1;
            if (currentIdx === 0) checkIdx = originalCount - 1;
            if (currentIdx > originalCount) checkIdx = 0;
            
            const currentElement = images[checkIdx];
            const isVideo = currentElement && currentElement.tagName.toLowerCase() === 'video';
            const duration = isVideo ? 6000 : 4000;

            slideTimer = setTimeout(() => {
                if (!isTransitioning) {
                    currentIdx++;
                    isTransitioning = true;
                    updateSlider();
                }
                startTimer();
            }, duration);
        }

        startTimer();

        // 도트 클릭 시 타이머 리셋
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                currentIdx = i + 1;
                isTransitioning = true;
                updateSlider();
                startTimer(); // 클릭 시 타이머 초기화
            });
        });
    }

    initSlider('myzy-slider');
    initSlider('yogiyo-slider');

    // Contact Title — Scramble Reveal Animation (Experience와 동일)
    const contactTitle = document.getElementById('contact-title');
    if (contactTitle) {
        const originalText = contactTitle.dataset.text;
        const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
        let hasPlayed = false;

        let scrambled = '';
        for (let i = 0; i < originalText.length; i++) {
            scrambled += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
        contactTitle.textContent = scrambled;

        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasPlayed) {
                    hasPlayed = true;
                    contactObserver.unobserve(entry.target);

                    let iteration = 0;
                    const totalIterations = originalText.length * 3;

                    const interval = setInterval(() => {
                        contactTitle.textContent = originalText
                            .split('')
                            .map((char, index) => {
                                if (index < Math.floor(iteration / 3)) {
                                    return char;
                                }
                                return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                            })
                            .join('');

                        iteration++;

                        if (iteration > totalIterations) {
                            clearInterval(interval);
                            contactTitle.textContent = originalText;
                        }
                    }, 40);
                }
            });
        }, { threshold: 0.3 });

        contactObserver.observe(contactTitle);

        // Contact Title 호버 스크램블 추가
        contactTitle.addEventListener('mouseenter', () => applyHoverScramble(contactTitle));
    }

    // Contact Email 호버 스크램블 추가
    const contactEmail = document.querySelector('.contact-email');
    if (contactEmail) {
        contactEmail.addEventListener('mouseenter', () => applyHoverScramble(contactEmail));
    }

    // Hover Scramble Common Function
    function applyHoverScramble(el) {
        if (el.dataset.scrambling === 'true') return;
        el.dataset.scrambling = 'true';

        const originalName = el.innerText;
        const hoverScrambleChars = '!<>-_\\/[]{}—=+*^?#';

        let iteration = 0;
        const totalLength = originalName.length;
        const maxIterations = totalLength + 8;

        const interval = setInterval(() => {
            el.textContent = originalName
                .split('')
                .map((char, index) => {
                    if (index < iteration - 8) return char;
                    if (char === ' ' || char === '(' || char === ')' || char === '@' || char === '.') return char;
                    return hoverScrambleChars[Math.floor(Math.random() * hoverScrambleChars.length)];
                })
                .join('');

            iteration++;
            if (iteration > maxIterations) {
                clearInterval(interval);
                el.textContent = originalName;
                el.dataset.scrambling = 'false';
            }
        }, 50);
    }
});

function initMatterPhysics() {
    const container = document.getElementById('matter-container');
    const wordsContainer = document.getElementById('words-container');
    if (!container || !wordsContainer) return;

    // module aliases
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint,
        Events = Matter.Events;

    // create an engine
    const engine = Engine.create();

    // create a renderer
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: container.offsetWidth,
            height: container.offsetHeight,
            background: 'transparent',
            wireframes: false
        }
    });

    // Make canvas invisible, we only see the DOM elements
    render.canvas.style.opacity = '0';

    const words = [
        "Graphic design", "Typography", "Design planning",
        "IP branding", "Character design", "Marketing design",
        "Brand experience"
    ];

    const palette = [
        { bg: '#2B53EB' }, // Blue
        { bg: '#58F3A8' }, // Green
        { bg: '#8C70F7' }, // Purple
        { bg: '#E35B63' }, // Red
        { bg: '#F5C651' }, // Yellow
        { bg: '#EB2BD6' }, // Magenta
        { bg: '#000000', text: '#FFFFFF' } // Black (White text exception)
    ];

    // 배열을 랜덤하게 섞는 함수
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // 단어 블록과 원 블록에 적용할 컬러 팔레트를 각각 섞어서 준비
    const shuffledWordColors = shuffle([...palette]);
    const shuffledCircleColors = shuffle([...palette]);

    const bodies = [];
    const domElements = [];

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // 뷰포트 너비에 따라 스케일 팩터 계산 (1200px 기준, 최소 0.5)
    const scaleFactor = Math.max(0.5, Math.min(1, width / 1200));

    // Create boundaries
    const ground = Bodies.rectangle(width / 2, height + 50, width * 2, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -2000, width * 2, 100, { isStatic: true });

    Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

    // Create word blocks
    words.forEach((word, index) => {
        // Create DOM element
        const el = document.createElement('div');
        el.className = 'word-block';

        // 뷰포트에 따라 폰트와 패딩을 비례 축소
        el.style.fontSize = (2.5 * scaleFactor) + 'rem';
        el.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';

        // 내부 텍스트를 감싸는 span 생성 (글리치 애니메이션용, 상위 div의 transform과 충돌하지 않기 위해)
        const innerText = document.createElement('span');
        innerText.className = 'word-text';
        innerText.innerText = word;
        el.appendChild(innerText);

        // 중복 없이 최대한 다양한 컬러가 들어가도록 섞인 팔레트에서 순차적으로 적용
        const color = shuffledWordColors[index % shuffledWordColors.length];
        el.style.backgroundColor = color.bg;
        el.style.color = color.text || '#000000'; // 기본 블랙, 예외(검은색 배경)일 경우 지정된 색상 사용
        if (color.border) el.style.border = color.border;

        wordsContainer.appendChild(el);
        domElements.push(el);

        // Dimensions
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        // 텍스트가 이모지로 짧아져도 박스 크기가 변하지 않도록 크기 고정 및 중앙 정렬
        el.style.width = elWidth + 'px';
        el.style.height = elHeight + 'px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.padding = '0'; // 고정 크기이므로 기존 padding 무효화

        // Create Physics body
        // 중앙 상단 부근에 뭉쳐서 생성
        const x = width / 2 + (Math.random() - 0.5) * 200;
        const y = -150 - (Math.random() * 200);

        const body = Bodies.rectangle(x, y, elWidth, elHeight, {
            restitution: 0.6, // Bounciness
            friction: 0.1,
            density: 0.001,
            chamfer: { radius: elHeight / 2 }, // Pill shape
            angle: (Math.random() - 0.5) * 0.5 // 초기 랜덤 회전각
        });

        // 충돌 이벤트에서 사용하기 위해 몸체에 DOM 요소 참조 및 식별자 추가
        body.domElement = innerText;
        body.isWord = true;
        innerText.dataset.originalText = word; // 원래 텍스트 저장

        // 사방으로 퍼지는 폭죽(Burst) 효과 속도 부여
        Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 25,
            y: (Math.random() - 0.5) * 5
        });

        bodies.push(body);
        Composite.add(engine.world, body);
    });

    // Create decorative circles
    for (let i = 0; i < 7; i++) {
        const el = document.createElement('div');
        el.className = 'circle-block';

        const size = Math.round(16 * scaleFactor); // 뷰포트에 비례 축소
        el.style.width = size + 'px';
        el.style.height = size + 'px';

        // 중복 없이 최대한 다양한 컬러가 들어가도록 섞인 팔레트에서 순차적으로 적용
        const color = shuffledCircleColors[i % shuffledCircleColors.length];
        el.style.backgroundColor = color.bg;
        if (color.border) el.style.border = color.border;

        wordsContainer.appendChild(el);
        domElements.push(el);

        // 중앙 상단 부근에 뭉쳐서 생성
        const x = width / 2 + (Math.random() - 0.5) * 200;
        const y = -150 - (Math.random() * 200);

        const body = Bodies.circle(x, y, size / 2, {
            restitution: 0.8, // Bouncier circles
            friction: 0.1,
            density: 0.001
        });

        // 사방으로 퍼지는 폭죽(Burst) 효과 속도 부여
        Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 35,
            y: (Math.random() - 0.5) * 10
        });

        bodies.push(body);
        Composite.add(engine.world, body);
    }

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    // 모바일 여부 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
        // 데스크톱에서만 마우스 드래그 활성화
        Composite.add(engine.world, mouseConstraint);
        // 마우스 휠 스크롤 방해 금지
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    } else {
        // 모바일에서는 캔버스의 터치 이벤트를 완전히 무시하여 스크롤 보장
        mouse.element.style.pointerEvents = 'none';

        // 히어로 섹션 전체에서 터치 감지 → 물리 바디 쿼리로 정확한 블록 탭/스와이프 처리
        const heroSection = document.getElementById('hero');
        let heroTouchStartX = 0, heroTouchStartY = 0, heroTouchStartTime = 0;

        heroSection.addEventListener('touchstart', (e) => {
            heroTouchStartX = e.touches[0].clientX;
            heroTouchStartY = e.touches[0].clientY;
            heroTouchStartTime = Date.now();
        }, { passive: true });

        heroSection.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const rect = render.canvas.getBoundingClientRect();

            // 캔버스 내 좌표로 변환 (스케일 보정)
            const scaleX = render.canvas.width / rect.width;
            const scaleY = render.canvas.height / rect.height;
            const point = {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };

            // 터치 위치 근처의 물리 바디 탐색 (80px 반경)
            const allBodies = Composite.allBodies(engine.world);
            let closestBody = null, closestDist = Infinity;
            for (const b of allBodies) {
                if (!b.isWord) continue;
                const dx = b.position.x - point.x;
                const dy = b.position.y - point.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 80 && dist < closestDist) {
                    closestDist = dist;
                    closestBody = b;
                }
            }

            if (closestBody) {
                const dx = touch.clientX - heroTouchStartX;
                const dy = touch.clientY - heroTouchStartY;
                const dt = Math.max((Date.now() - heroTouchStartTime) / 1000, 0.05);
                const swipeDist = Math.sqrt(dx * dx + dy * dy);

                let fx, fy;
                if (swipeDist < 15) {
                    // 탭: 위로 크게 튀기기
                    fx = (Math.random() - 0.5) * 0.2;
                    fy = -0.45;
                } else {
                    // 스와이프: 손가락 방향으로 힘 부여
                    const speed = Math.min(swipeDist / dt / 4000, 0.3);
                    fx = (dx / swipeDist) * speed;
                    fy = (dy / swipeDist) * speed;
                }

                Matter.Body.applyForce(closestBody, closestBody.position, { x: fx, y: fy });
                triggerTextScramble(closestBody.domElement);
            }
        }, { passive: true });
    }

    render.mouse = mouse;

    const chars = '!<>-_\\/[]{}—=+*^?#________';

    // 충돌 시 텍스트 스크램블 효과 트리거
    Events.on(engine, 'collisionStart', function (event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;

            // 속도가 일정 수준 이상일 때만 발생
            if (bodyA.isWord && bodyA.domElement && bodyA.speed > 1.5) triggerTextScramble(bodyA.domElement);
            if (bodyB.isWord && bodyB.domElement && bodyB.speed > 1.5) triggerTextScramble(bodyB.domElement);
        });
    });

    function triggerTextScramble(el) {
        if (el.dataset.flashing === 'true') return;

        el.dataset.flashing = 'true';
        const originalText = el.dataset.originalText;
        const length = originalText.length;

        let iterations = 0;
        const maxIterations = 5; // 5번 빠르게 스크램블

        const interval = setInterval(() => {
            let scrambled = '';
            for (let i = 0; i < length; i++) {
                if (originalText[i] === ' ') {
                    scrambled += ' ';
                } else {
                    scrambled += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            el.innerText = scrambled;
            iterations++;

            if (iterations >= maxIterations) {
                clearInterval(interval);
                el.innerText = originalText;
                el.dataset.flashing = 'false';
            }
        }, 40); // 40ms 간격으로 변경 (총 약 200ms)
    }

    // Sync DOM elements with physics bodies
    Events.on(engine, 'afterUpdate', function () {
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const el = domElements[i];

            const x = body.position.x - el.offsetWidth / 2;
            const y = body.position.y - el.offsetHeight / 2;

            el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
        }
    });

    // 초기 너비 기록 (리사이즈 시 비율 계산 기준)
    const initialWidth = width;

    // 리사이즈 시 시각적 스케일 적용 함수
    function applyVisualScale() {
        const currentWidth = container.offsetWidth;
        const visualScale = Math.min(1, currentWidth / initialWidth);
        wordsContainer.style.transformOrigin = 'top left';
        wordsContainer.style.transform = `scale(${visualScale})`;
        render.canvas.style.transformOrigin = 'top left';
        render.canvas.style.transform = `scale(${visualScale})`;
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;
        render.canvas.width = newWidth;
        render.canvas.height = newHeight;
        Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 50 });
        Matter.Body.setPosition(rightWall, { x: newWidth + 50, y: newHeight / 2 });
        applyVisualScale();
    });

    // run the renderer
    Render.run(render);

    // run the engine
    const runner = Runner.create();
    Runner.run(runner, engine);
}

function initContactPhysics() {
    const container = document.getElementById('contact-physics-container');
    const contactSection = document.getElementById('contact');
    if (!container || !contactSection) return;

    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    const engine = Engine.create();
    let render, runner;
    let width, height;
    let ground, leftWall, rightWall;

    const palette = ['#2B53EB', '#58F3A8', '#8C70F7', '#E35B63', '#F5C651', '#EB2BD6', '#000000'];
    let spawnedCount = 0;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && spawnedCount === 0) {
                width = container.offsetWidth;
                height = container.offsetHeight;

                render = Render.create({
                    element: container,
                    engine: engine,
                    options: {
                        width: width,
                        height: height,
                        background: 'transparent',
                        wireframes: false
                    }
                });

                const boundaryOptions = { isStatic: true, render: { visible: false } };
                ground = Bodies.rectangle(width / 2, height + 50, width * 10, 100, boundaryOptions);
                leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, boundaryOptions);
                rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, boundaryOptions);

                Composite.add(engine.world, [ground, leftWall, rightWall]);

                Render.run(render);
                runner = Runner.create();
                Runner.run(runner, engine);

                const spawnInterval = setInterval(() => {
                    if (spawnedCount >= 100) {
                        clearInterval(spawnInterval);
                        return;
                    }

                    const size = 12;
                    // 전체 가로 영역 중 랜덤한 위치에서 튀어오름
                    const xSpawn = Math.random() * width;
                    const ySpawn = height + 20;

                    const ball = Bodies.circle(xSpawn, ySpawn, size / 2, {
                        restitution: 0.7,
                        friction: 0.05,
                        render: {
                            fillStyle: palette[Math.floor(Math.random() * palette.length)]
                        }
                    });

                    Matter.Body.setVelocity(ball, {
                        x: (Math.random() - 0.5) * 6, // 좌우로 퍼짐
                        y: -12 - Math.random() * 6    // 위로 튀어오름
                    });

                    Composite.add(engine.world, ball);
                    spawnedCount++;
                }, 2500); // 2.5초 간격으로 소폭 단축

                // 리사이즈 대응
                window.addEventListener('resize', () => {
                    if (!render) return;
                    width = container.offsetWidth;
                    height = container.offsetHeight;
                    render.canvas.width = width;
                    render.canvas.height = height;
                    Matter.Body.setPosition(ground, { x: width / 2, y: height + 50 });
                    Matter.Body.setPosition(leftWall, { x: -50, y: height / 2 });
                    Matter.Body.setPosition(rightWall, { x: width + 50, y: height / 2 });
                });

                observer.unobserve(contactSection);
            }
        });
    }, { threshold: 0.1 }); // 10%만 보여도 바로 시작

    observer.observe(contactSection);
}
