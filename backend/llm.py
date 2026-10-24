import os

PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()


def complete(system: str, history: list[dict]) -> str:
    """history: [{"role": "user"|"assistant", "content": str}, ...]"""
    if PROVIDER == "openai":
        from openai import OpenAI

        client = OpenAI()
        res = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1"),
            messages=[{"role": "system", "content": system}, *history],
        )
        return res.choices[0].message.content or ""

    from anthropic import Anthropic

    client = Anthropic()
    res = client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5"),
        max_tokens=2048,
        system=system,
        messages=history,
    )
    return "".join(b.text for b in res.content if b.type == "text")
