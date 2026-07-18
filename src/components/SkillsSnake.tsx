'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type SVGProps,
} from 'react';

type NodeId = string;

export type GalaxyNode = {
  id: NodeId;
  label: string;
  content: ReactNode;
};

export type GalaxyControls = {
  spacingRadius: number;
  repulsionStrength: number;
  springStiffness: number;
  damping: number;
  dragElasticity: number;
  maxMovement: number;
  idleIntensity: number;
  lineThickness: number;
  lineColor: string;
  lineOpacity: number;
  animationSpeed: number;
};

type RuntimeNode = {
  id: NodeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
  radius: number;
  primary: boolean;
};

const defaultControls: GalaxyControls = {
  spacingRadius: 235,
  repulsionStrength: 1.2,
  springStiffness: 0.026,
  damping: 0.95,
  dragElasticity: 0.16,
  maxMovement: 180,
  idleIntensity: 0.5,
  lineThickness: 1,
  lineColor: 'currentColor',
  lineOpacity: 0.24,
  animationSpeed: 0.82,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type SnakeDirection = 'up' | 'down' | 'left' | 'right';

type SnakePoint = {
  x: number;
  y: number;
};

type SnakeBoard = {
  width: number;
  height: number;
  columns: number;
  rows: number;
  cellSize: number;
};

type RevealedSkill = {
  id: string;
  label: string;
  accent: string;
  point: SnakePoint;
};

const snakeDirections: Record<SnakeDirection, SnakePoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const isOppositeDirection = (current: SnakeDirection, next: SnakeDirection) => (
  (current === 'up' && next === 'down') ||
  (current === 'down' && next === 'up') ||
  (current === 'left' && next === 'right') ||
  (current === 'right' && next === 'left')
);

const createInitialSnake = (columns: number, rows: number) => {
  const startX = Math.floor(columns / 2);
  const startY = Math.floor(rows / 2);

  return Array.from({ length: 6 }, (_, index) => ({
    x: clamp(startX - index, 0, columns - 1),
    y: startY,
  }));
};

const manualControlDuration = 1600;

const getWindingDirection = (
  head: SnakePoint,
  board: SnakeBoard,
  currentDirection: SnakeDirection,
): SnakeDirection => {
  const leftEdge = 1;
  const rightEdge = Math.max(board.columns - 2, leftEdge + 1);
  const movingRight = head.y % 2 === 0;

  if (movingRight && head.x >= rightEdge) {
    return currentDirection === 'up' ? 'right' : 'down';
  }

  if (!movingRight && head.x <= leftEdge) {
    return currentDirection === 'up' ? 'left' : 'down';
  }

  return movingRight ? 'right' : 'left';
};

const hasEnoughIconSpace = (
  point: SnakePoint,
  existingPoints: SnakePoint[],
  board: SnakeBoard,
) => {
  const minimumGap = clamp(board.cellSize * 3.2, 64, 96);

  return existingPoints.every((existingPoint) => {
    const dx = (existingPoint.x - point.x) * board.cellSize;
    const dy = (existingPoint.y - point.y) * board.cellSize;

    return Math.hypot(dx, dy) >= minimumGap;
  });
};

const createRandomApple = (
  board: SnakeBoard,
  snake: SnakePoint[],
  blockedPoints: SnakePoint[] = [],
): SnakePoint => {
  const unavailablePoints = new Set(
    [...snake, ...blockedPoints].map((point) => `${point.x}:${point.y}`),
  );

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const point = {
      x: Math.floor(Math.random() * board.columns),
      y: Math.floor(Math.random() * board.rows),
    };

    if (!unavailablePoints.has(`${point.x}:${point.y}`)) {
      return point;
    }
  }

  return {
    x: Math.max(0, board.columns - 2),
    y: Math.max(0, board.rows - 2),
  };
};

const getAppleChaseDirection = (
  head: SnakePoint,
  apple: SnakePoint,
  currentDirection: SnakeDirection,
): SnakeDirection => {
  const horizontalDirection: SnakeDirection = apple.x > head.x ? 'right' : 'left';
  const verticalDirection: SnakeDirection = apple.y > head.y ? 'down' : 'up';
  const horizontalDistance = Math.abs(apple.x - head.x);
  const verticalDistance = Math.abs(apple.y - head.y);
  const preferredDirections = horizontalDistance >= verticalDistance
    ? [horizontalDirection, verticalDirection]
    : [verticalDirection, horizontalDirection];
  const nextDirection = preferredDirections.find(
    (direction) => !isOppositeDirection(currentDirection, direction),
  );

  return nextDirection ?? currentDirection;
};

const getHeadEyeStyle = (direction: SnakeDirection, side: 'first' | 'second'): CSSProperties => {
  const sidePosition = side === 'first' ? '34%' : '66%';

  if (direction === 'left') {
    return { left: '30%', top: sidePosition, transform: 'translate(-50%, -50%)' };
  }

  if (direction === 'right') {
    return { left: '70%', top: sidePosition, transform: 'translate(-50%, -50%)' };
  }

  if (direction === 'up') {
    return { left: sidePosition, top: '30%', transform: 'translate(-50%, -50%)' };
  }

  return { left: sidePosition, top: '70%', transform: 'translate(-50%, -50%)' };
};

export function PhysicsNodeGalaxy({
  nodes,
  primaryNodeId,
  controls,
  className = '',
  compact = false,
  density = 'normal',
}: {
  nodes: GalaxyNode[];
  primaryNodeId: NodeId;
  controls?: Partial<GalaxyControls>;
  className?: string;
  compact?: boolean;
  density?: 'normal' | 'large' | 'small';
}) {
  const mergedControls = useMemo(() => ({ ...defaultControls, ...controls }), [controls]);
  const { primaryNode, satelliteNodes, orderedNodes } = useMemo(() => {
    const primary = nodes.find((node) => node.id === primaryNodeId) ?? nodes[0];
    const satellites = nodes.filter((node) => node.id !== primary?.id);

    return {
      primaryNode: primary,
      satelliteNodes: satellites,
      orderedNodes: primary ? [primary, ...satellites] : [],
    };
  }, [nodes, primaryNodeId]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const tickRef = useRef<(time: number) => void>(() => undefined);
  const lastTimeRef = useRef(0);
  const nodeRefs = useRef(new Map<NodeId, HTMLDivElement>());
  const lineRefs = useRef(new Map<NodeId, SVGLineElement>());
  const runtimeRef = useRef<RuntimeNode[]>([]);
  const sizeRef = useRef({ width: 1, height: 1 });
  const dragRef = useRef<{
    id: NodeId;
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const setNodeRef = useCallback((id: NodeId) => {
    return (element: HTMLDivElement | null) => {
      if (element) {
        nodeRefs.current.set(id, element);
      } else {
        nodeRefs.current.delete(id);
      }
    };
  }, []);

  const setLineRef = useCallback((id: NodeId) => {
    return (element: SVGLineElement | null) => {
      if (element) {
        lineRefs.current.set(id, element);
      } else {
        lineRefs.current.delete(id);
      }
    };
  }, []);

  const arrangeNodes = useCallback(() => {
    const container = containerRef.current;

    if (!container || !primaryNode) {
      return;
    }

    const { width, height } = container.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;
    const previousNodes = new Map(runtimeRef.current.map((node) => [node.id, node]));
    const compact = width < 640;
    const densityScale = density === 'large' ? 2.15 : density === 'small' ? 0.7 : 0.78;
    const radius = compact
      ? Math.min(width * 0.38, mergedControls.spacingRadius * densityScale)
      : Math.min(Math.min(width, height) * 0.38, mergedControls.spacingRadius);
    const xRadius = compact ? Math.min(width * 0.36, radius * 1.45) : radius * 1.28;
    const yRadius = compact ? Math.min(height * 0.36, radius * 1.08) : radius;

    sizeRef.current = { width, height };
    runtimeRef.current = orderedNodes.map((node, index) => {
      const element = nodeRefs.current.get(node.id);
      const previous = previousNodes.get(node.id);
      const widthValue = element?.offsetWidth ?? 120;
      const heightValue = element?.offsetHeight ?? 74;
      const primary = node.id === primaryNode.id;
      const nodeRadius = Math.max(widthValue, heightValue) / 2;
      let anchorX = centerX;
      let anchorY = centerY;

      if (!primary) {
        const satelliteIndex = index - 1;
        const angle = -Math.PI / 2 + (Math.PI * 2 * satelliteIndex) / Math.max(satelliteNodes.length, 1);
        anchorX = centerX + Math.cos(angle) * xRadius;
        anchorY = centerY + Math.sin(angle) * yRadius;
      }

      return {
        id: node.id,
        x: previous ? clamp(previous.x, nodeRadius, width - nodeRadius) : anchorX,
        y: previous ? clamp(previous.y, nodeRadius, height - nodeRadius) : anchorY,
        vx: previous?.vx ?? 0,
        vy: previous?.vy ?? 0,
        anchorX,
        anchorY,
        width: widthValue,
        height: heightValue,
        radius: nodeRadius,
        primary,
      };
    });
  }, [density, mergedControls.spacingRadius, orderedNodes, primaryNode, satelliteNodes.length]);

  const updateDom = useCallback(() => {
    const runtimeNodes = runtimeRef.current;
    const primary = runtimeNodes.find((node) => node.primary);

    runtimeNodes.forEach((node) => {
      const element = nodeRefs.current.get(node.id);

      if (element) {
        element.style.transform = `translate3d(${node.x - node.width / 2}px, ${node.y - node.height / 2}px, 0)`;
      }
    });

    if (!primary) {
      return;
    }

    satelliteNodes.forEach((node) => {
      const runtimeNode = runtimeNodes.find((item) => item.id === node.id);
      const line = lineRefs.current.get(node.id);

      if (!runtimeNode || !line) {
        return;
      }

      line.setAttribute('x1', String(primary.x));
      line.setAttribute('y1', String(primary.y));
      line.setAttribute('x2', String(runtimeNode.x));
      line.setAttribute('y2', String(runtimeNode.y));
    });
  }, [satelliteNodes]);

  const tick = useCallback(
    (time: number) => {
      const runtimeNodes = runtimeRef.current;
      const { width, height } = sizeRef.current;
      const delta = clamp((time - lastTimeRef.current) / 16.67, 0.5, 2);
      const drag = dragRef.current;

      lastTimeRef.current = time;

      runtimeNodes.forEach((node, index) => {
        const idle = node.primary ? 0.4 : 1;
        let targetX = node.anchorX + Math.sin(time * 0.001 * mergedControls.animationSpeed + index) * mergedControls.idleIntensity * 10 * idle;
        let targetY = node.anchorY + Math.cos(time * 0.0008 * mergedControls.animationSpeed + index * 1.4) * mergedControls.idleIntensity * 10 * idle;

        if (drag?.id === node.id) {
          const desiredX = drag.pointerX + drag.offsetX;
          const desiredY = drag.pointerY + drag.offsetY;
          const dx = desiredX - node.anchorX;
          const dy = desiredY - node.anchorY;
          const distance = Math.hypot(dx, dy);
          const limit = mergedControls.maxMovement;

          if (distance > limit) {
            targetX = node.anchorX + (dx / distance) * limit;
            targetY = node.anchorY + (dy / distance) * limit;
          } else {
            targetX = desiredX;
            targetY = desiredY;
          }
        }

        const spring = drag?.id === node.id
          ? mergedControls.springStiffness * (1 + mergedControls.dragElasticity)
          : mergedControls.springStiffness;

        node.vx += (targetX - node.x) * spring * delta;
        node.vy += (targetY - node.y) * spring * delta;
      });

      for (let firstIndex = 0; firstIndex < runtimeNodes.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < runtimeNodes.length; secondIndex += 1) {
          const first = runtimeNodes[firstIndex];
          const second = runtimeNodes[secondIndex];
          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const distance = Math.max(Math.hypot(dx, dy), 1);
          const minimumDistance = first.radius + second.radius + 16;

          if (distance >= minimumDistance) {
            continue;
          }

          const force = ((minimumDistance - distance) / minimumDistance) * mergedControls.repulsionStrength * 0.45;
          const fx = (dx / distance) * force * delta;
          const fy = (dy / distance) * force * delta;

          if (!first.primary && drag?.id !== first.id) {
            first.vx -= fx;
            first.vy -= fy;
          }

          if (!second.primary && drag?.id !== second.id) {
            second.vx += fx;
            second.vy += fy;
          }
        }
      }

      runtimeNodes.forEach((node) => {
        node.vx *= Math.pow(mergedControls.damping, delta);
        node.vy *= Math.pow(mergedControls.damping, delta);
        node.x = clamp(node.x + node.vx * delta, node.width / 2 + 8, width - node.width / 2 - 8);
        node.y = clamp(node.y + node.vy * delta, node.height / 2 + 8, height - node.height / 2 - 8);
      });

      updateDom();
      frameRef.current = window.requestAnimationFrame((nextTime) => tickRef.current(nextTime));
    },
    [mergedControls, updateDom],
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      arrangeNodes();
      updateDom();
    });

    resizeObserver.observe(container);
    arrangeNodes();
    updateDom();

    return () => resizeObserver.disconnect();
  }, [arrangeNodes, updateDom]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    frameRef.current = window.requestAnimationFrame((time) => tickRef.current(time));

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>, id: NodeId) => {
    const container = containerRef.current;
    const runtimeNode = runtimeRef.current.find((node) => node.id === id);

    if (!container || !runtimeNode) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    dragRef.current = {
      id,
      pointerX,
      pointerY,
      offsetX: runtimeNode.x - pointerX,
      offsetY: runtimeNode.y - pointerY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;

    if (!container || !drag) {
      return;
    }

    const rect = container.getBoundingClientRect();

    drag.pointerX = event.clientX - rect.left;
    drag.pointerY = event.clientY - rect.top;
  };

  const handlePointerUp = () => {
    const releasedNodeId = dragRef.current?.id;

    if (releasedNodeId) {
      const releasedNode = runtimeRef.current.find((node) => node.id === releasedNodeId);

      if (releasedNode) {
        releasedNode.vx *= 0.18;
        releasedNode.vy *= 0.18;
      }
    }

    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-transparent text-foreground ${
        compact
          ? density === 'large'
            ? 'h-[18rem] sm:h-[19rem] xl:h-[20rem]'
            : 'h-[15rem] sm:h-[16rem]'
          : 'h-[34rem] sm:h-[39rem] md:h-[43rem]'
      } ${className}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {satelliteNodes.map((node) => (
          <line
            key={node.id}
            ref={setLineRef(node.id)}
            stroke={mergedControls.lineColor}
            strokeLinecap="round"
            strokeOpacity={mergedControls.lineOpacity}
            strokeWidth={mergedControls.lineThickness}
          />
        ))}
      </svg>

      {orderedNodes.map((node) => (
        <div
          key={node.id}
          ref={setNodeRef(node.id)}
          role="button"
          tabIndex={0}
          aria-label={`${node.label} draggable node`}
          onPointerDown={(event) => handlePointerDown(event, node.id)}
          className="absolute left-0 top-0 z-10 touch-none select-none cursor-grab outline-none will-change-transform active:cursor-grabbing"
        >
          {node.content}
        </div>
      ))}
    </div>
  );
}

const skillGroups = [
  {
    id: 'core',
    title: 'Core Web Technologies',
    technologies: ['HTML5', 'CSS3', 'JavaScript ES6+', 'TypeScript', 'Responsive Design'],
    icon: CodeIcon,
    accent: '#14B8A6',
  },
  {
    id: 'frameworks',
    title: 'Frameworks & Libraries',
    technologies: [
      'React',
      'Vue',
      'Next.js',
      'Nuxt 3',
      'React Query',
      'React Router DOM',
      'Tailwind CSS',
      'shadcn/ui',
      'GSAP',
      'Vuetify 3',
      'Zustand',
      'Pinia',
      'Leaflet',
      'Iconify',
      'i18n',
    ],
    icon: ComponentIcon,
    accent: '#60A5FA',
  },
  {
    id: 'api',
    title: 'API & HTTP',
    technologies: [
      'Axios',
      'REST API',
      'Fetch API',
      'Forms',
      'Validation',
      'SSR',
      'SEO Metadata',
      'Performance',
    ],
    icon: NetworkIcon,
    accent: '#F97316',
  },
  {
    id: 'auth',
    title: 'Authentication & Access',
    technologies: ['Secure Login', 'Role-Based Access'],
    icon: ShieldIcon,
    accent: '#A78BFA',
  },
  {
    id: 'languages',
    title: 'Programming Languages',
    technologies: ['C# Basics', 'SQL', 'Databases'],
    icon: DatabaseIcon,
    accent: '#22C55E',
  },
  {
    id: 'design',
    title: 'Design & UI',
    technologies: ['Figma to Code', 'Dark Mode', 'Light Mode'],
    icon: PaletteIcon,
    accent: '#F472B6',
  },
  {
    id: 'tools',
    title: 'Tools & Version Control',
    technologies: ['Git', 'GitHub', 'GitLab', 'Bitbucket'],
    icon: GitBranchIcon,
    accent: '#64748B',
  },
] as const;

const projectAccentColors = [
  '#25BDF2',
  '#008C78',
  '#7C3AED',
  '#F97316',
  '#65A30D',
  '#DB2777',
] as const;

const skillItems = skillGroups.flatMap((group) =>
  group.technologies.map((technology, technologyIndex) => ({
    id: `${group.id}-${technology}`,
    label: technology,
    accent: projectAccentColors[technologyIndex % projectAccentColors.length],
  })),
);

const initialSnakeBoard: SnakeBoard = {
  width: 1,
  height: 1,
  columns: 24,
  rows: 16,
  cellSize: 28,
};
const initialSnake = createInitialSnake(initialSnakeBoard.columns, initialSnakeBoard.rows);

export default function SkillsNodeGalaxy() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastMoveRef = useRef(0);
  const snakeRef = useRef<SnakePoint[]>(initialSnake);
  const boardRef = useRef<SnakeBoard>(initialSnakeBoard);
  const directionRef = useRef<SnakeDirection>('right');
  const queuedDirectionRef = useRef<SnakeDirection>('right');
  const manualControlUntilRef = useRef(0);
  const visitedRef = useRef(new Set<string>());
  const revealIndexRef = useRef(0);
  const targetLengthRef = useRef(6);
  const stepsSinceRevealRef = useRef(0);
  const revealedSkillPointsRef = useRef<SnakePoint[]>([]);
  const appleRef = useRef<SnakePoint | null>(null);
  const hasStartedRef = useRef(false);
  const pointerStartRef = useRef<SnakePoint | null>(null);
  const [board, setBoard] = useState<SnakeBoard>(initialSnakeBoard);
  const [snake, setSnake] = useState<SnakePoint[]>(initialSnake);
  const [apple, setApple] = useState<SnakePoint | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [renderDirection, setRenderDirection] = useState<SnakeDirection>('right');
  const [revealedSkills, setRevealedSkills] = useState<RevealedSkill[]>([]);

  const queueDirection = useCallback((nextDirection: SnakeDirection) => {
    const currentDirection = directionRef.current;

    if (!isOppositeDirection(currentDirection, nextDirection)) {
      queuedDirectionRef.current = nextDirection;
      manualControlUntilRef.current = performance.now() + manualControlDuration;
    }
  }, []);

  const revealSkillAt = useCallback((point: SnakePoint) => {
    if (revealIndexRef.current >= skillItems.length) {
      return;
    }

    stepsSinceRevealRef.current += 1;

    if (stepsSinceRevealRef.current < 4) {
      return;
    }

    if (!hasEnoughIconSpace(point, revealedSkillPointsRef.current, boardRef.current)) {
      return;
    }

    const skill = skillItems[revealIndexRef.current];
    revealedSkillPointsRef.current = [...revealedSkillPointsRef.current, point];

    setRevealedSkills((currentSkills) => [
      ...currentSkills,
      {
        id: `${skill.id}-${revealIndexRef.current}`,
        label: skill.label,
        accent: skill.accent,
        point,
      },
    ]);
    revealIndexRef.current += 1;
    stepsSinceRevealRef.current = 0;
    targetLengthRef.current = Math.min(32, 6 + revealIndexRef.current);
  }, []);

  const moveSnake = useCallback(() => {
    const currentBoard = boardRef.current;
    const currentSnake = snakeRef.current;
    let nextSkillPoint: SnakePoint | null = null;
    const head = currentSnake[0] ?? {
      x: Math.floor(currentBoard.columns / 2),
      y: Math.floor(currentBoard.rows / 2),
    };
    const currentApple = appleRef.current;
    const autoDirection = currentApple
      ? getAppleChaseDirection(head, currentApple, directionRef.current)
      : getWindingDirection(head, currentBoard, directionRef.current);
    const nextDirection = performance.now() < manualControlUntilRef.current
      ? queuedDirectionRef.current
      : autoDirection;

    if (!isOppositeDirection(directionRef.current, nextDirection)) {
      directionRef.current = nextDirection;
    }

    const vector = snakeDirections[directionRef.current];
    setRenderDirection(directionRef.current);
    const nextHead = {
      x: (head.x + vector.x + currentBoard.columns) % currentBoard.columns,
      y: (head.y + vector.y + currentBoard.rows) % currentBoard.rows,
    };
    const nextSnake = [nextHead, ...currentSnake].slice(0, targetLengthRef.current);
    const visitedKey = `${nextHead.x}:${nextHead.y}`;
    const reachedApple = currentApple?.x === nextHead.x && currentApple.y === nextHead.y;

    if (!visitedRef.current.has(visitedKey)) {
      visitedRef.current.add(visitedKey);
      nextSkillPoint = nextHead;
    }

    if (reachedApple) {
      targetLengthRef.current = Math.min(36, targetLengthRef.current + 1);
      const nextApple = createRandomApple(currentBoard, nextSnake, revealedSkillPointsRef.current);

      appleRef.current = nextApple;
      setApple(nextApple);
    }

    snakeRef.current = nextSnake;
    setSnake(nextSnake);

    if (nextSkillPoint) {
      revealSkillAt(nextSkillPoint);
    }
  }, [revealSkillAt]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      const cellSize = clamp(Math.round(width / 32), 18, 30);
      const nextBoard = {
        width,
        height,
        columns: Math.max(14, Math.floor(width / cellSize)),
        rows: Math.max(10, Math.floor(height / cellSize)),
        cellSize,
      };

      if (
        nextBoard.columns === boardRef.current.columns &&
        nextBoard.rows === boardRef.current.rows &&
        nextBoard.cellSize === boardRef.current.cellSize
      ) {
        boardRef.current = nextBoard;
        setBoard(nextBoard);
        return;
      }

      const nextSnake = createInitialSnake(nextBoard.columns, nextBoard.rows);
      const nextApple = hasStartedRef.current ? createRandomApple(nextBoard, nextSnake) : null;

      boardRef.current = nextBoard;
      snakeRef.current = nextSnake;
      appleRef.current = nextApple;
      directionRef.current = 'right';
      queuedDirectionRef.current = 'right';
      manualControlUntilRef.current = 0;
      visitedRef.current = new Set(nextSnake.map((point) => `${point.x}:${point.y}`));
      revealIndexRef.current = 0;
      targetLengthRef.current = 6;
      stepsSinceRevealRef.current = 0;
      revealedSkillPointsRef.current = [];
      setBoard(nextBoard);
      setSnake(nextSnake);
      setApple(nextApple);
      setRenderDirection('right');
      setRevealedSkills([]);
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStartedRef.current) {
          return;
        }

        const nextApple = createRandomApple(boardRef.current, snakeRef.current);

        hasStartedRef.current = true;
        appleRef.current = nextApple;
        lastMoveRef.current = performance.now();
        setApple(nextApple);
        setHasStarted(true);
        observer.disconnect();
      },
      {
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.2,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyDirection: Record<string, SnakeDirection> = {
        ArrowUp: 'up',
        w: 'up',
        W: 'up',
        ArrowDown: 'down',
        s: 'down',
        S: 'down',
        ArrowLeft: 'left',
        a: 'left',
        A: 'left',
        ArrowRight: 'right',
        d: 'right',
        D: 'right',
      };
      const nextDirection = keyDirection[event.key];

      if (!nextDirection) {
        return;
      }

      event.preventDefault();
      queueDirection(nextDirection);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queueDirection]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const animate = (time: number) => {
      const currentBoard = boardRef.current;
      const moveDelay = currentBoard.cellSize <= 20 ? 145 : 112;

      if (time - lastMoveRef.current >= moveDelay) {
        lastMoveRef.current = time;
        moveSnake();
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    lastMoveRef.current = performance.now();
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [hasStarted, moveSnake]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const startPoint = pointerStartRef.current;

    if (!startPoint) {
      return;
    }

    const dx = event.clientX - startPoint.x;
    const dy = event.clientY - startPoint.y;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < board.cellSize * 0.8) {
      return;
    }

    queueDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const startPoint = pointerStartRef.current;

    if (!startPoint) {
      return;
    }

    const dx = event.clientX - startPoint.x;
    const dy = event.clientY - startPoint.y;
    const head = snakeRef.current[0];

    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 12) {
      queueDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    } else if (head && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = (event.clientX - rect.left) / board.cellSize;
      const pointerY = (event.clientY - rect.top) / board.cellSize;
      const deltaX = pointerX - head.x;
      const deltaY = pointerY - head.y;

      queueDirection(Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'right' : 'left') : (deltaY > 0 ? 'down' : 'up'));
    }

    pointerStartRef.current = null;
  };

  return (
    <section id="skills" ref={sectionRef} className="w-full max-w-7xl px-4 py-16 sm:px-8 md:px-2">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Skills
        </h2>
      </div>
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Interactive skills snake. Use arrow keys, WASD, mouse drag, or swipe to steer."
        className="relative h-[26rem] w-full touch-none overflow-hidden bg-transparent text-foreground outline-none sm:h-[34rem] md:h-[34rem]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
      >
        {apple ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: apple.x * board.cellSize + board.cellSize / 2,
              top: apple.y * board.cellSize + board.cellSize / 2,
              width: clamp(board.cellSize * 0.62, 12, 20),
              height: clamp(board.cellSize * 0.62, 12, 20),
            }}
            aria-hidden="true"
          >
            <span className="absolute -right-[8%] -top-[20%] h-[38%] w-[42%] rotate-45 rounded-full bg-[#65A30D]" />
            <span className="absolute inset-0 rounded-full bg-[#DB2777] shadow-[0_0_14px_rgba(219,39,119,0.45)]" />
            <span className="absolute left-[24%] top-[18%] h-[24%] w-[24%] rounded-full bg-white/70" />
          </div>
        ) : null}

        {revealedSkills.map((skill) => {
          const iconSize = clamp(board.cellSize * 1.95, 32, 59);

          return (
            <div
              key={skill.id}
              className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-foreground/90 opacity-90 transition-colors duration-300"
              style={{
                left: skill.point.x * board.cellSize + board.cellSize / 2,
                top: skill.point.y * board.cellSize + board.cellSize / 2 - iconSize / 2,
                width: Math.max(iconSize * 1.8, 72),
              }}
              title={skill.label}
            >
              <span
                className="grid place-items-center rounded-full border border-foreground/15 [[data-theme=dark]_&]:border-foreground/20"
                style={{
                  width: iconSize,
                  height: iconSize,
                  borderColor: skill.accent,
                  boxShadow: `0 0 18px ${skill.accent}55`,
                }}
              >
                <TechIcon label={skill.label} className="size-[68%]" />
              </span>
              <span className="max-w-full truncate text-center text-[0.58rem] font-semibold leading-none text-foreground/70 sm:text-[0.62rem]">
                {skill.label}
              </span>
            </div>
          );
        })}

        {snake.map((segment, index) => {
          const segmentSize = Math.max(10, board.cellSize - 5);
          const isHead = index === 0;

          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-[0.45rem] bg-foreground transition-[background-color,box-shadow] duration-300 ${
                isHead
                  ? 'scale-110 shadow-[0_0_22px_rgba(0,0,0,0.2)] [[data-theme=dark]_&]:shadow-[0_0_24px_rgba(255,255,255,0.28)]'
                  : 'opacity-80'
              }`}
              style={{
                left: segment.x * board.cellSize + board.cellSize / 2,
                top: segment.y * board.cellSize + board.cellSize / 2,
                width: segmentSize,
                height: segmentSize,
                opacity: isHead ? 1 : clamp(1 - index * 0.025, 0.38, 0.9),
              }}
            >
              {isHead ? (
                <>
                  <span
                    className="absolute size-[18%] rounded-full bg-background"
                    style={getHeadEyeStyle(renderDirection, 'first')}
                  />
                  <span
                    className="absolute size-[18%] rounded-full bg-background"
                    style={getHeadEyeStyle(renderDirection, 'second')}
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TechIcon({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel === 'vue') {
    return <VueLogo className={className} />;
  }

  if (normalizedLabel === 'react' || normalizedLabel === 'react query' || normalizedLabel === 'react router dom') {
    return <ReactLogo className={className} />;
  }

  if (normalizedLabel === 'next.js') {
    return <NextLogo className={className} />;
  }

  if (normalizedLabel === 'nuxt 3') {
    return <NuxtLogo className={className} />;
  }

  if (normalizedLabel === 'tailwind css') {
    return <TailwindLogo className={className} />;
  }

  if (normalizedLabel === 'vuetify 3') {
    return <VuetifyLogo className={className} />;
  }

  if (normalizedLabel === 'pinia') {
    return <PiniaLogo className={className} />;
  }

  if (normalizedLabel === 'leaflet') {
    return <LeafletLogo className={className} />;
  }

  if (normalizedLabel === 'html5') {
    return <HtmlLogo className={className} />;
  }

  if (normalizedLabel === 'css3') {
    return <CssLogo className={className} />;
  }

  if (normalizedLabel.includes('javascript')) {
    return <BadgeIcon className={className} label="JS" color="#F7DF1E" textColor="#111827" />;
  }

  if (normalizedLabel === 'typescript') {
    return <BadgeIcon className={className} label="TS" color="#3178C6" />;
  }

  if (normalizedLabel === 'c# basics') {
    return <BadgeIcon className={className} label="C#" color="#68217A" />;
  }

  if (normalizedLabel === 'sql') {
    return <BadgeIcon className={className} label="SQL" color="#2563EB" />;
  }

  if (normalizedLabel === 'git') {
    return <GitBranchIcon className={className} />;
  }

  if (normalizedLabel === 'github') {
    return <GitHubLogo className={className} />;
  }

  if (normalizedLabel === 'gitlab') {
    return <GitLabLogo className={className} />;
  }

  if (normalizedLabel === 'bitbucket') {
    return <BitbucketLogo className={className} />;
  }

  if (normalizedLabel === 'figma to code') {
    return <FigmaLogo className={className} />;
  }

  if (normalizedLabel.includes('sql') || normalizedLabel.includes('database')) {
    return <DatabaseIcon className={className} />;
  }

  if (normalizedLabel.includes('login') || normalizedLabel.includes('role')) {
    return <ShieldIcon className={className} />;
  }

  if (normalizedLabel.includes('seo') || normalizedLabel.includes('performance')) {
    return <PerformanceIcon className={className} />;
  }

  if (normalizedLabel.includes('dark') || normalizedLabel.includes('light')) {
    return <ThemeIcon className={className} />;
  }

  if (normalizedLabel.includes('axios') || normalizedLabel.includes('api') || normalizedLabel.includes('fetch') || normalizedLabel.includes('ssr')) {
    if (normalizedLabel === 'axios') {
      return <BadgeIcon className={className} label="AX" color="#5A29E4" />;
    }

    return <NetworkIcon className={className} />;
  }

  if (normalizedLabel === 'gsap') {
    return <BadgeIcon className={className} label="GS" color="#88CE02" textColor="#111827" />;
  }

  if (normalizedLabel === 'zustand') {
    return <BadgeIcon className={className} label="Z" color="#7C3AED" />;
  }

  if (normalizedLabel === 'iconify') {
    return <BadgeIcon className={className} label="IC" color="#1769AA" />;
  }

  if (normalizedLabel === 'i18n') {
    return <BadgeIcon className={className} label="i18n" color="#0F766E" />;
  }

  return <CircleSkillIcon className={className} label={label.slice(0, 2).toUpperCase()} />;
}

function VueLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#41B883" d="M2 4h5l5 8.5L17 4h5L12 21 2 4Z" />
      <path fill="#35495E" d="M7 4h3l2 3.4L14 4h3l-5 8.5L7 4Z" />
    </svg>
  );
}

function ReactLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#61DAFB" strokeWidth="1.45" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.7" fill="#61DAFB" stroke="none" />
    </svg>
  );
}

function NextLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M7.4 7.2h2.1l5.5 8.2V7.2h1.6v9.6h-2.1L9 8.7v8.1H7.4V7.2Z"
        fill="var(--background)"
      />
    </svg>
  );
}

function NuxtLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#00DC82" d="M8.2 19.5H2.8L9.6 7.8l2.7 4.7-4.1 7Z" />
      <path fill="#00C16A" d="M12.3 19.5H6.9L14.1 7l7.1 12.5h-5.4l-1.7-3-1.8 3Z" />
    </svg>
  );
}

function TailwindLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#38BDF8"
        d="M12 6.2c-2.7 0-4.4 1.3-5.2 4 1-.7 1.9-1 2.8-.8.5.1.9.4 1.3.8.7.7 1.5 1.5 3.3 1.5 2.7 0 4.4-1.3 5.2-4-1 .7-1.9 1-2.8.8-.5-.1-.9-.4-1.3-.8-.7-.7-1.5-1.5-3.3-1.5Zm-5.2 6.1c-2.7 0-4.4 1.3-5.2 4 1-.7 1.9-1 2.8-.8.5.1.9.4 1.3.8.7.7 1.5 1.5 3.3 1.5 2.7 0 4.4-1.3 5.2-4-1 .7-1.9 1-2.8.8-.5-.1-.9-.4-1.3-.8-.7-.7-1.5-1.5-3.3-1.5Z"
      />
    </svg>
  );
}

function VuetifyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#1697F6" d="M12 22 2.5 4h6L12 10.7 15.5 4h6L12 22Z" />
      <path fill="#7BC6FF" d="M12 22 8.5 15.2 12 10.7l3.5 4.5L12 22Z" />
    </svg>
  );
}

function PiniaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#FFD859" d="M5 5c2.8-.8 5-.3 7 1.4C14 4.7 16.2 4.2 19 5c.4 6.5-1.8 11.2-7 14-5.2-2.8-7.4-7.5-7-14Z" />
      <path fill="#41B883" d="M12 6.4V19c-3.5-2.3-5-5.8-4.7-10.5C9 8.3 10.5 7.6 12 6.4Z" />
      <path fill="#35495E" d="M12 6.4C13.5 7.6 15 8.3 16.7 8.5 17 13.2 15.5 16.7 12 19V6.4Z" />
    </svg>
  );
}

function LeafletLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#199900" d="M12 21C6 16.5 3 12.6 3 8.7A6.7 6.7 0 0 1 9.8 2C14.2 2 18 5.5 18 9.7c0 3.5-2.2 7.2-6 11.3Z" />
      <path fill="#8CD86A" d="M11.9 18.2c-2.2-5.2-1.1-9 3.2-11.5.9 4.5-.2 8.3-3.2 11.5Z" />
    </svg>
  );
}

function HtmlLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#E34F26" d="m4 2 1.5 17L12 22l6.5-3L20 2H4Z" />
      <path fill="#fff" d="M8 7h8l-.2 2H10l.1 2h5.5l-.5 5.2L12 17.5l-3.1-1.3-.2-2.4h2l.1 1 1.2.5 1.2-.5.2-1.8H8.5L8 7Z" />
    </svg>
  );
}

function CssLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#1572B6" d="m4 2 1.5 17L12 22l6.5-3L20 2H4Z" />
      <path fill="#fff" d="M8 7h8l-.2 2h-5.5l-.1 2h5.4l-.5 5.2L12 17.5l-3.1-1.3-.2-2.4h2l.1 1 1.2.5 1.2-.5.2-1.8H8.3L8 7Z" />
    </svg>
  );
}

function FigmaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="9" cy="6" r="3" fill="#F24E1E" />
      <circle cx="15" cy="6" r="3" fill="#FF7262" />
      <circle cx="9" cy="12" r="3" fill="#A259FF" />
      <circle cx="15" cy="12" r="3" fill="#1ABCFE" />
      <circle cx="9" cy="18" r="3" fill="#0ACF83" />
    </svg>
  );
}

function GitHubLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.37 9.37 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function GitLabLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#FC6D26" d="M12 21 3.3 14.7 5.2 3.8 9 12h6l3.8-8.2 1.9 10.9L12 21Z" />
      <path fill="#E24329" d="M12 21 9 12h6l-3 9Z" />
      <path fill="#FCA326" d="M3.3 14.7 9 12 12 21 3.3 14.7Zm17.4 0L15 12l-3 9 8.7-6.3Z" />
    </svg>
  );
}

function BitbucketLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#2684FF" d="M3 4h18l-2.6 15.8A2 2 0 0 1 16.5 21h-9a2 2 0 0 1-1.9-1.7L3 4Z" />
      <path fill="#0052CC" d="M9 15.8h6l1-6.3H8l1 6.3Z" />
    </svg>
  );
}

function BadgeIcon({
  label,
  color,
  textColor = '#ffffff',
  className,
}: {
  label: string;
  color: string;
  textColor?: string;
  className: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="4" fill={color} />
      <text
        x="12"
        y="15.2"
        textAnchor="middle"
        fill={textColor}
        fontSize="8"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

function PerformanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14a8 8 0 1 1 16 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 14 4-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 18h10" />
    </svg>
  );
}

function ThemeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.16" />
      <path fill="currentColor" d="M12 3a9 9 0 1 0 0 18V3Z" />
    </svg>
  );
}

function CircleSkillIcon({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <text
        x="12"
        y="14.6"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

function CodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 9-4 3 4 3m8-6 4 3-4 3M14 5l-4 14" />
    </svg>
  );
}

function ComponentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <path strokeLinejoin="round" d="M7 4h10l5 8-5 8H7l-5-8 5-8Z" />
    </svg>
  );
}

function NetworkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.5 2.8 8.4 7 10 4.2-1.6 7-5.5 7-10V6l-7-3Z" />
    </svg>
  );
}

function DatabaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <rect x="5" y="5" width="14" height="14" />
    </svg>
  );
}

function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <path strokeLinejoin="round" d="M12 3 3 21h18L12 3Z" />
    </svg>
  );
}

function GitBranchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <path strokeLinejoin="round" d="M7 4h10l5 8-5 8H7l-5-8 5-8Z" />
    </svg>
  );
}
