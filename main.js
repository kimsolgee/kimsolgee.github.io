document.addEventListener("DOMContentLoaded", () => {
    // Matter.js Physics Animation for Hero
    initMatterPhysics();

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

    // Create boundaries
    const ground = Bodies.rectangle(width/2, height + 50, width * 2, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, height/2, 100, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 50, height/2, 100, height * 2, { isStatic: true });
    const ceiling = Bodies.rectangle(width/2, -2000, width * 2, 100, { isStatic: true });

    Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

    // Create word blocks
    words.forEach((word, index) => {
        // Create DOM element
        const el = document.createElement('div');
        el.className = 'word-block';
        
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
        
        const size = 16; // 24px에서 30% 축소
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

    // 데스크톱 환경에서 마우스 휠 스크롤이 먹통이 되는 현상 방지 (Matter.js 휠 캡처 해제)
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    
    // 모바일 환경 터치 스크롤 문제 해결
    mouse.element.removeEventListener('touchstart', mouse.mousedown);
    mouse.element.removeEventListener('touchmove', mouse.mousemove);
    mouse.element.removeEventListener('touchend', mouse.mouseup);

    mouse.element.addEventListener('touchstart', mouse.mousedown, { passive: true });
    mouse.element.addEventListener('touchmove', (e) => {
        if (mouseConstraint.body) {
            e.preventDefault(); // 블록을 잡고 있을 때만 스크롤 방지
        }
        mouse.mousemove(e);
    }, { passive: false });
    mouse.element.addEventListener('touchend', mouse.mouseup, { passive: true });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    const chars = '!<>-_\\/[]{}—=+*^?#________';

    // 충돌 시 텍스트 스크램블 효과 트리거
    Events.on(engine, 'collisionStart', function(event) {
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
            for(let i=0; i<length; i++) {
                if (originalText[i] === ' ') {
                    scrambled += ' ';
                } else {
                    scrambled += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            el.innerText = scrambled;
            iterations++;
            
            if(iterations >= maxIterations) {
                clearInterval(interval);
                el.innerText = originalText;
                el.dataset.flashing = 'false';
            }
        }, 40); // 40ms 간격으로 변경 (총 약 200ms)
    }

    // Sync DOM elements with physics bodies
    Events.on(engine, 'afterUpdate', function() {
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const el = domElements[i];
            
            const x = body.position.x - el.offsetWidth / 2;
            const y = body.position.y - el.offsetHeight / 2;
            
            el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;
        render.canvas.width = newWidth;
        render.canvas.height = newHeight;
        Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 50 });
        Matter.Body.setPosition(rightWall, { x: newWidth + 50, y: newHeight / 2 });
    });

    // run the renderer
    Render.run(render);

    // run the engine
    const runner = Runner.create();
    Runner.run(runner, engine);
}
