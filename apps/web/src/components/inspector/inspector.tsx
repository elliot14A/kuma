/** @jsxImportSource preact */
import type { Challenge } from '@kuma/domain'
import { BookOpen, Code2, Gauge, Hash, Sliders, Terminal, Timer } from 'lucide-preact'
import { colors } from '#/styles/tokens'
import {
  containerStyle,
  descriptionBoxStyle,
  difficultyBadgeRecipe,
  headerStyle,
  headerTitleGroupStyle,
  itemIconStyle,
  itemLeftStyle,
  itemRowStyle,
  itemValueStyle,
  listStyle,
  sectionTitleStyle,
  tagListStyle,
  tagPillStyle,
} from './inspector.css'

export interface InspectorProps {
  challenge: Challenge
  difficulty?: 'easy' | 'medium' | 'hard' | undefined
  tags?: string[] | undefined
}

export const Inspector = ({
  challenge,
  difficulty = 'medium',
  tags = ['systems', 'ttl', 'cache', 'data-structures'],
}: InspectorProps) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return colors.success
      case 'hard':
        return colors.danger
      default:
        return colors.warning
    }
  }

  return (
    <div className={containerStyle}>
      <div className={headerStyle}>
        <div className={headerTitleGroupStyle}>
          <Sliders size={13} color={colors.accent} />
          <span>Configuration</span>
        </div>
      </div>

      <div className={sectionTitleStyle}>
        <Terminal size={12} color={colors.info} />
        <span>Execution Target</span>
      </div>

      <div className={listStyle}>
        <div className={itemRowStyle}>
          <div className={itemLeftStyle}>
            <span className={itemIconStyle}>
              <Code2 size={13} color={colors.info} />
            </span>
            <span>Runtime</span>
          </div>
          <span className={itemValueStyle}>
            {challenge.language === 'typescript' ? 'TypeScript (Bun)' : 'Python 3'}
          </span>
        </div>

        <div className={itemRowStyle}>
          <div className={itemLeftStyle}>
            <span className={itemIconStyle}>
              <Gauge size={13} color={getDifficultyColor()} />
            </span>
            <span>Difficulty</span>
          </div>
          <span className={difficultyBadgeRecipe({ difficulty })}>{difficulty}</span>
        </div>

        <div className={itemRowStyle}>
          <div className={itemLeftStyle}>
            <span className={itemIconStyle}>
              <Timer size={13} color={colors.warning} />
            </span>
            <span>Time Limit</span>
          </div>
          <span className={itemValueStyle}>{challenge.timeLimitMinutes} mins</span>
        </div>
      </div>

      <div className={sectionTitleStyle}>
        <BookOpen size={12} color={colors.purple} />
        <span>Blueprint Summary</span>
      </div>
      <div className={descriptionBoxStyle}>{challenge.description}</div>

      <div className={sectionTitleStyle}>
        <Hash size={12} color={colors.accent} />
        <span>Categorization</span>
      </div>

      <div className={tagListStyle}>
        {tags.map((tag) => (
          <span key={tag} className={tagPillStyle}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}
