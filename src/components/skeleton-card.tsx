import { Card, Box, Skeleton, Flex } from '@radix-ui/themes'

export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <Card size={compact ? '1' : '2'}>
      <Skeleton>
        <Box style={{ width: '100%', aspectRatio: '16 / 9' }} />
      </Skeleton>
      <Box p={compact ? '2' : '3'}>
        <Flex direction="column" gap="2">
          <Skeleton><Box style={{ height: 20, width: '70%' }} /></Skeleton>
          {!compact && <Skeleton><Box style={{ height: 16, width: '40%' }} /></Skeleton>}
        </Flex>
      </Box>
    </Card>
  )
}
