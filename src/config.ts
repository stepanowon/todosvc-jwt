// 프로젝트 루트의 .env 파일이 있으면 환경변수로 로드한다. (없으면 무시)
// Vercel 등 배포 환경에서는 플랫폼에 설정한 환경변수를 그대로 사용한다.
try {
    process.loadEnvFile();
} catch {
    // .env 파일이 없는 경우
}

// 비밀키 기반(HMAC) 알고리즘만 허용한다
const JWT_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
type JwtAlgorithm = typeof JWT_ALGORITHMS[number];

const algorithm = (process.env.JWT_ALGORITHM ?? 'HS512') as JwtAlgorithm;
if (!JWT_ALGORITHMS.includes(algorithm)) {
    throw new Error(`JWT_ALGORITHM은 ${JWT_ALGORITHMS.join(', ')} 중 하나여야 합니다. (현재 값: ${algorithm})`);
}

if (!process.env.JWT_SECRET_KEY) {
    console.warn('[경고] JWT_SECRET_KEY 환경변수가 없어 개발용 기본 비밀키를 사용합니다. 운영 환경에서는 반드시 설정하세요.');
}

// 숫자만 입력하면 초 단위로 처리한다
// (jose는 숫자를 절대 시각(epoch)으로 해석하므로 "3600s" 형태의 문자열로 변환한다)
const toExpiresIn = (value: string | undefined, defaultValue: string): string => {
    if (!value) return defaultValue;
    return /^\d+$/.test(value) ? `${value}s` : value;
}

export const jwtConfig = {
    secretKey: process.env.JWT_SECRET_KEY || 'mysecretkey',
    algorithm,
    issuer: process.env.JWT_ISSUER || 'jwt test server',
    // jose 시간 표현식 (예: 30m, 1h, 7d) 또는 초 단위 숫자
    accessTokenExpiresIn: toExpiresIn(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, '1h'),
    refreshTokenExpiresIn: toExpiresIn(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, '7d'),
};
