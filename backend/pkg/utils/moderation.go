package utils

import (
	"encoding/json"
	"os"
	"regexp"

	"github.com/ikawaha/kagome-dict/ipa"
	"github.com/ikawaha/kagome/v2/tokenizer"
)

var urlPattern = regexp.MustCompile(`https?://[^\s]+|www\.[^\s]+`)

func ContainsURL(text string) bool {
	return urlPattern.MatchString(text)
}

type NGWordList struct {
	NGWords []string `json:"ng_words"`
}

var ngWords []string

func LoadNGWords(path string) error {
	file, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var list NGWordList
	if err := json.Unmarshal(file, &list); err != nil {
		return err
	}
	ngWords = list.NGWords
	return nil
}

func ContainsNGWord(text string) bool {
	t, err := tokenizer.New(ipa.Dict(), tokenizer.OmitBosEos())
	if err != nil {
		return false
	}

	tokens := t.Tokenize(text)
	for _, token := range tokens {
		for _, ng := range ngWords {
			if token.Surface == ng {
				return true
			}
		}
	}
	return false
}
