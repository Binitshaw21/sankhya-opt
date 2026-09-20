from api.slm_translator import LocalRefinerySLM
from run_sankhya import SANKHYAMINLPEngine


def test_translator_extracts_refinery_constraints():
	result = LocalRefinerySLM().translate_prompt_to_model(
		'Keep sulfur below 18.5, maintain octane above 46000, '
		'and limit reforming capacity to 500 barrels/day.'
	)

	assert result['status'] == 'TRANSLATED_SUCCESSFULLY'
	assert result['extracted_parameters'] == {
		'max_sulfur_pool': 18.5,
		'min_octane_target': 46000.0,
		'max_reforming_capacity': 500.0,
	}


def test_cli_solver_class_import_is_available():
	assert SANKHYAMINLPEngine.__name__ == 'SANKHYAMINLPEngine'
