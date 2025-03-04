import type { Variant } from '@unocss/core'
import type { PresetWeappOptions } from '..'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantColorsMediaOrClass } from './dark'
import { variantLanguageDirections } from './directions'
import { variantCssLayer, variantInternalLayer, variantScope, variantSelector, variantSpaceAndDivide, variantVariables } from './misc'
import { variantNegative } from './negative'
import { variantImportant } from './important'
import { variantCustomMedia, variantPrint } from './media'
import { variantSupports } from './supports'
import { partClasses, variantPseudoClassFunctions, variantPseudoClassesAndElements, variantTaggedPseudoClasses } from './pseudo'
import { variantAria } from './aria'
import { variantDataAttribute } from './data'
import { variantContainerQuery } from './container'

export const variants = (options: PresetWeappOptions): Variant<Theme>[] => [
  variantAria,
  variantDataAttribute,
  variantCssLayer,

  variantSelector,
  variantInternalLayer,
  variantNegative,
  variantImportant,
  variantSupports,
  variantPrint,
  variantCustomMedia,
  variantBreakpoints,
  ...variantCombinators,
  variantSpaceAndDivide,

  variantPseudoClassesAndElements,
  variantPseudoClassFunctions,
  ...variantTaggedPseudoClasses(options),

  partClasses,
  ...variantColorsMediaOrClass(options),
  ...variantLanguageDirections,
  variantScope,

  variantContainerQuery,
  variantVariables,
]
